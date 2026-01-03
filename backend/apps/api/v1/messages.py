from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from typing import List, Optional
from db import get_db
from models.message import Message, MessageStatus
from models.user import User
from models.order import Order
from schemas.message import MessageCreate, MessageResponse, MessageUpdate, ConversationResponse
from utils.dependencies import get_current_user
from messages.index import (
    create_message,
    get_message_by_id,
    get_user_messages,
    get_order_conversation,
    mark_message_as_read,
    update_message,
    delete_message,
    get_unread_count,
    get_conversation_participants
)

router = APIRouter(prefix="/messages", tags=["messages"])


def enrich_message_response(message: Message, db: Session) -> dict:
    """Helper function to add sender, recipient, and order details to message"""
    message_dict = {
        "id": message.id,
        "order_id": message.order_id,
        "sender_id": message.sender_id,
        "recipient_id": message.recipient_id,
        "subject": message.subject,
        "message": message.message,
        "message_type": message.message_type,
        "status": message.status,
        "created_at": message.created_at,
        "read_at": message.read_at,
    }
    
    # Get sender details
    if message.sender:
        message_dict["sender"] = {
            "id": message.sender.id,
            "full_name": message.sender.full_name,
            "email": message.sender.email,
            "username": message.sender.username
        }
    
    # Get recipient details
    if message.recipient:
        message_dict["recipient"] = {
            "id": message.recipient.id,
            "full_name": message.recipient.full_name,
            "email": message.recipient.email,
            "username": message.recipient.username
        }
    
    # Get order details if applicable
    if message.order_id and message.order:
        message_dict["order"] = {
            "id": message.order.id,
            "status": message.order.status,
            "device_id": message.order.device_id
        }
    
    return message_dict


@router.post("", response_model=MessageResponse, status_code=201)
async def send_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a new message
    """
    # Verify recipient exists
    recipient = db.execute(select(User).where(User.id == data.recipient_id)).scalar_one_or_none()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Verify order exists if order_id is provided
    if data.order_id:
        order = db.execute(select(Order).where(Order.id == data.order_id)).scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
    
    # Create message
    message = create_message(db, data, current_user.id)
    
    # Reload with relationships
    result = db.execute(
        select(Message)
        .options(
            selectinload(Message.sender),
            selectinload(Message.recipient),
            selectinload(Message.order)
        )
        .where(Message.id == message.id)
    )
    message = result.scalar_one()
    
    return enrich_message_response(message, db)


@router.get("", response_model=dict)
async def list_messages(
    message_type: str = Query("inbox", description="'inbox', 'sent', or 'all'"),
    status: Optional[MessageStatus] = Query(None, description="Filter by message status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messages for current user (inbox/sent/all)
    """
    messages, total = get_user_messages(db, current_user.id, message_type, status, limit, offset)
    
    # Reload messages with relationships
    message_ids = [m.id for m in messages]
    result = db.execute(
        select(Message)
        .options(
            selectinload(Message.sender),
            selectinload(Message.recipient),
            selectinload(Message.order)
        )
        .where(Message.id.in_(message_ids))
        .order_by(Message.created_at.desc())
    )
    messages = result.scalars().all()
    
    items = [enrich_message_response(msg, db) for msg in messages]
    
    return {
        "items": items,
        "total": total,
        "page": (offset // limit) + 1,
        "limit": limit
    }


@router.get("/unread-count", response_model=dict)
async def get_unread_messages_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get count of unread messages for current user
    """
    count = get_unread_count(db, current_user.id)
    return {"unread_count": count}


@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific message by ID
    """
    # Get message with relationships
    result = db.execute(
        select(Message)
        .options(
            selectinload(Message.sender),
            selectinload(Message.recipient),
            selectinload(Message.order)
        )
        .where(Message.id == message_id)
    )
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check authorization
    if message.sender_id != current_user.id and message.recipient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this message")
    
    return enrich_message_response(message, db)


@router.patch("/{message_id}/read", response_model=MessageResponse)
async def mark_as_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a message as read (only recipient can mark as read)
    """
    message = mark_message_as_read(db, message_id, current_user.id)
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found or not authorized")
    
    # Reload with relationships
    result = db.execute(
        select(Message)
        .options(
            selectinload(Message.sender),
            selectinload(Message.recipient),
            selectinload(Message.order)
        )
        .where(Message.id == message.id)
    )
    message = result.scalar_one()
    
    return enrich_message_response(message, db)


@router.patch("/{message_id}", response_model=MessageResponse)
async def update_message_endpoint(
    message_id: int,
    data: MessageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a message (sender can edit content, recipient can update status)
    """
    message = update_message(db, message_id, current_user.id, data)
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found or not authorized")
    
    # Reload with relationships
    result = db.execute(
        select(Message)
        .options(
            selectinload(Message.sender),
            selectinload(Message.recipient),
            selectinload(Message.order)
        )
        .where(Message.id == message.id)
    )
    message = result.scalar_one()
    
    return enrich_message_response(message, db)


@router.delete("/{message_id}", status_code=204)
async def delete_message_endpoint(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a message (sender or recipient can delete)
    """
    success = delete_message(db, message_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Message not found or not authorized")
    
    return None


@router.get("/conversation/{order_id}", response_model=ConversationResponse)
async def get_conversation(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all messages for a specific order (conversation thread)
    """
    # Verify order exists
    order = db.execute(select(Order).where(Order.id == order_id)).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get conversation messages
    messages = get_order_conversation(db, order_id, current_user.id)
    
    # Reload messages with relationships
    message_ids = [m.id for m in messages]
    if message_ids:
        result = db.execute(
            select(Message)
            .options(
                selectinload(Message.sender),
                selectinload(Message.recipient),
                selectinload(Message.order)
            )
            .where(Message.id.in_(message_ids))
            .order_by(Message.created_at.asc())
        )
        messages = result.scalars().all()
    
    # Get participants
    participants = get_conversation_participants(db, order_id)
    participants_data = [
        {
            "id": p.id,
            "full_name": p.full_name,
            "email": p.email,
            "username": p.username
        }
        for p in participants
    ]
    
    return {
        "order_id": order_id,
        "messages": [enrich_message_response(msg, db) for msg in messages],
        "participants": participants_data
    }

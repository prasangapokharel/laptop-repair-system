from sqlalchemy.orm import Session
from sqlalchemy import select, or_, and_
from typing import List, Optional
from datetime import datetime
from models.message import Message, MessageStatus
from models.user import User
from schemas.message import MessageCreate, MessageUpdate


def create_message(db: Session, data: MessageCreate, sender_id: int) -> Message:
    """
    Create a new message
    
    Args:
        db: Database session
        data: Message creation data
        sender_id: ID of the user sending the message
        
    Returns:
        Created Message object
    """
    message = Message(
        order_id=data.order_id,
        sender_id=sender_id,
        recipient_id=data.recipient_id,
        subject=data.subject,
        message=data.message,
        message_type=data.message_type,
        status=MessageStatus.UNREAD
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_message_by_id(db: Session, message_id: int, user_id: int) -> Optional[Message]:
    """
    Get a specific message by ID (only if user is sender or recipient)
    
    Args:
        db: Database session
        message_id: ID of the message
        user_id: ID of the current user
        
    Returns:
        Message object or None if not found or unauthorized
    """
    result = db.execute(
        select(Message).where(
            Message.id == message_id,
            or_(Message.sender_id == user_id, Message.recipient_id == user_id)
        )
    )
    return result.scalar_one_or_none()


def get_user_messages(
    db: Session,
    user_id: int,
    message_type: str = "all",  # "inbox", "sent", "all"
    status: Optional[MessageStatus] = None,
    limit: int = 50,
    offset: int = 0
) -> tuple[List[Message], int]:
    """
    Get messages for a specific user
    
    Args:
        db: Database session
        user_id: ID of the user
        message_type: "inbox" for received, "sent" for sent, "all" for both
        status: Optional filter by message status
        limit: Maximum number of messages to return
        offset: Number of messages to skip
        
    Returns:
        Tuple of (list of messages, total count)
    """
    # Build query based on message type
    if message_type == "inbox":
        query = select(Message).where(Message.recipient_id == user_id)
        count_query = select(Message).where(Message.recipient_id == user_id)
    elif message_type == "sent":
        query = select(Message).where(Message.sender_id == user_id)
        count_query = select(Message).where(Message.sender_id == user_id)
    else:  # "all"
        query = select(Message).where(
            or_(Message.sender_id == user_id, Message.recipient_id == user_id)
        )
        count_query = select(Message).where(
            or_(Message.sender_id == user_id, Message.recipient_id == user_id)
        )
    
    # Apply status filter if provided
    if status:
        query = query.where(Message.status == status)
        count_query = count_query.where(Message.status == status)
    
    # Get total count
    total = len(db.execute(count_query).scalars().all())
    
    # Apply pagination and ordering
    query = query.order_by(Message.created_at.desc()).limit(limit).offset(offset)
    
    result = db.execute(query)
    messages = result.scalars().all()
    
    return messages, total


def get_order_conversation(db: Session, order_id: int, user_id: int) -> List[Message]:
    """
    Get all messages related to a specific order (conversation thread)
    
    Args:
        db: Database session
        order_id: ID of the order
        user_id: ID of the current user (for authorization check)
        
    Returns:
        List of messages in chronological order
    """
    # Get messages for this order where user is involved
    result = db.execute(
        select(Message)
        .where(
            Message.order_id == order_id,
            or_(Message.sender_id == user_id, Message.recipient_id == user_id)
        )
        .order_by(Message.created_at.asc())
    )
    return result.scalars().all()


def mark_message_as_read(db: Session, message_id: int, user_id: int) -> Optional[Message]:
    """
    Mark a message as read (only if user is the recipient)
    
    Args:
        db: Database session
        message_id: ID of the message
        user_id: ID of the current user
        
    Returns:
        Updated Message object or None if not found/unauthorized
    """
    message = get_message_by_id(db, message_id, user_id)
    
    if not message or message.recipient_id != user_id:
        return None
    
    if message.status != MessageStatus.READ:
        message.status = MessageStatus.READ
        message.read_at = datetime.utcnow()
        db.commit()
        db.refresh(message)
    
    return message


def update_message(
    db: Session,
    message_id: int,
    user_id: int,
    data: MessageUpdate
) -> Optional[Message]:
    """
    Update a message (only sender can edit content, only recipient can update status)
    
    Args:
        db: Database session
        message_id: ID of the message
        user_id: ID of the current user
        data: Update data
        
    Returns:
        Updated Message object or None if not found/unauthorized
    """
    message = get_message_by_id(db, message_id, user_id)
    
    if not message:
        return None
    
    # Only sender can edit message content
    if data.message and message.sender_id == user_id:
        message.message = data.message
    
    # Only recipient can update status
    if data.status and message.recipient_id == user_id:
        message.status = data.status
        if data.status == MessageStatus.READ and not message.read_at:
            message.read_at = datetime.utcnow()
    
    db.commit()
    db.refresh(message)
    return message


def delete_message(db: Session, message_id: int, user_id: int) -> bool:
    """
    Delete a message (only sender or recipient can delete)
    
    Args:
        db: Database session
        message_id: ID of the message
        user_id: ID of the current user
        
    Returns:
        True if deleted, False if not found/unauthorized
    """
    message = get_message_by_id(db, message_id, user_id)
    
    if not message:
        return False
    
    db.delete(message)
    db.commit()
    return True


def get_unread_count(db: Session, user_id: int) -> int:
    """
    Get count of unread messages for a user
    
    Args:
        db: Database session
        user_id: ID of the user
        
    Returns:
        Count of unread messages
    """
    result = db.execute(
        select(Message).where(
            Message.recipient_id == user_id,
            Message.status == MessageStatus.UNREAD
        )
    )
    return len(result.scalars().all())


def get_conversation_participants(db: Session, order_id: int) -> List[User]:
    """
    Get all users who have participated in an order conversation
    
    Args:
        db: Database session
        order_id: ID of the order
        
    Returns:
        List of unique users involved in the conversation
    """
    # Get all unique sender and recipient IDs
    result = db.execute(
        select(Message).where(Message.order_id == order_id)
    )
    messages = result.scalars().all()
    
    user_ids = set()
    for msg in messages:
        user_ids.add(msg.sender_id)
        user_ids.add(msg.recipient_id)
    
    # Fetch user objects
    if not user_ids:
        return []
    
    result = db.execute(
        select(User).where(User.id.in_(user_ids))
    )
    return result.scalars().all()

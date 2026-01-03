from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class MessageType(str, Enum):
    QUERY = "Query"
    ADVICE = "Advice"
    STATUS_UPDATE = "Status Update"
    GENERAL = "General"


class MessageStatus(str, Enum):
    SENT = "Sent"
    READ = "Read"
    UNREAD = "Unread"


class MessageCreate(BaseModel):
    order_id: Optional[int] = Field(None, description="Related order ID (optional)")
    recipient_id: int = Field(..., description="User ID of message recipient")
    subject: Optional[str] = Field(None, max_length=200, description="Message subject")
    message: str = Field(..., description="Message content")
    message_type: MessageType = Field(MessageType.GENERAL, description="Type of message")


class MessageUpdate(BaseModel):
    status: Optional[MessageStatus] = Field(None, description="Update message status")
    message: Optional[str] = Field(None, description="Update message content")


class MessageResponse(BaseModel):
    id: int
    order_id: Optional[int]
    sender_id: int
    recipient_id: int
    subject: Optional[str]
    message: str
    message_type: MessageType
    status: MessageStatus
    created_at: datetime
    read_at: Optional[datetime]
    
    # Populated from relationships
    sender: Optional[dict] = None
    recipient: Optional[dict] = None
    order: Optional[dict] = None

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    order_id: int
    messages: list[MessageResponse]
    participants: list[dict]

    class Config:
        from_attributes = True

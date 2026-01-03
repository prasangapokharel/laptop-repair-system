from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base
import enum

class MessageStatus(enum.Enum):
    SENT = "Sent"
    READ = "Read"
    UNREAD = "Unread"

class MessageType(enum.Enum):
    QUERY = "Query"
    ADVICE = "Advice"
    STATUS_UPDATE = "Status Update"
    GENERAL = "General"

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    order_id = Column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=True, index=True)
    sender_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    subject = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)
    message_type = Column(SQLEnum(MessageType), default=MessageType.GENERAL, nullable=False)
    status = Column(SQLEnum(MessageStatus), default=MessageStatus.UNREAD, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    order = relationship("Order", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_messages")

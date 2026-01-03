from sqlalchemy import Column, BigInteger, String, Numeric, Text, ForeignKey, DateTime, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(BigInteger, primary_key=True)
    device_id = Column(BigInteger, ForeignKey("devices.id", ondelete="RESTRICT"), nullable=False, index=True)
    customer_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), index=True)
    problem_id = Column(BigInteger, ForeignKey("problems.id", ondelete="SET NULL"), index=True)
    cost = Column(Numeric(10, 2), default=0.00)
    discount = Column(Numeric(10, 2), default=0.00)
    total_cost = Column(Numeric(10, 2), default=0.00)
    note = Column(Text)
    status = Column(String(20), nullable=False, default="Pending", index=True)
    estimated_completion_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    assigns = relationship("OrderAssign", back_populates="order", cascade="all, delete-orphan")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="order", cascade="all, delete-orphan")
    problem = relationship("Problem")

    __table_args__ = (
        CheckConstraint("status IN ('Pending', 'Repairing', 'Completed', 'Cancelled')", name="chk_order_status"),
    )


class OrderAssign(Base):
    __tablename__ = "order_assign"

    id = Column(BigInteger, primary_key=True)
    order_id = Column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="assigns")

    __table_args__ = (UniqueConstraint("order_id", "user_id"),)


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(BigInteger, primary_key=True)
    order_id = Column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), nullable=False)
    changed_by = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    note = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    order = relationship("Order", back_populates="status_history")


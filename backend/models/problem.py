from sqlalchemy import Column, BigInteger, String, Text, Numeric, Boolean, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base


class Problem(Base):
    __tablename__ = "problems"

    id = Column(BigInteger, primary_key=True)
    device_type_id = Column(BigInteger, ForeignKey("device_types.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    device_type = relationship("DeviceType")
    cost_settings = relationship("CostSetting", back_populates="problem", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("device_type_id", "name"),)


class CostSetting(Base):
    __tablename__ = "cost_settings"

    id = Column(BigInteger, primary_key=True)
    problem_id = Column(BigInteger, ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    base_cost = Column(Numeric(10, 2), nullable=False, default=0.00)
    min_cost = Column(Numeric(10, 2))
    max_cost = Column(Numeric(10, 2))
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    problem = relationship("Problem", back_populates="cost_settings")


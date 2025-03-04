from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base



class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    fullname = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)

    #connection between the tables
    expenses = relationship(
        "Expense", back_populates="user", cascade="all, delete, delete-orphan"
    )
    budgets = relationship(
        "MonthlyBudget", back_populates="user", cascade="all, delete, delete-orphan"
    )


class Expense(Base):
    __tablename__ = "expenses"
    __table_args__ = {"extend_existing": True}
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(String(255))
    amount = Column(Float, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="expenses")


class MonthlyBudget(Base):
    __tablename__ = "monthly_budgets"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    budget = Column(Float, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="budgets")
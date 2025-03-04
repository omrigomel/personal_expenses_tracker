from fastapi import HTTPException
from typing import Optional, List

from models import Expense

expenses: List[Expense] = []
monthly_budget: Optional[float] = None
VALID_CATEGORIES = {"food", "transport", "entertainment", "health"}


def calculate_total():
    return sum(payment.amount for payment in expenses)

def get_payment_or_404(payment_id: int):
    if payment_id < 0 or payment_id >= len(expenses):
        raise HTTPException(status_code=404, detail="Payment not found")
    return expenses[payment_id]


def validate_password_strength(password: str) -> bool:

    if len(password) < 8:
        return False


    if not any(ch.isupper() for ch in password):
        return False

    return True
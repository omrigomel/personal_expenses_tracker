from pydantic import BaseModel,StrictFloat, StrictFloat
from typing import Optional
from sqlalchemy import Column, Integer, Float

from DataBase.database import Base



class Expense(BaseModel):
    amount: StrictFloat
    category: str
    description: Optional[str] = ""
    user_id: Optional[int] = 1


class Budget(BaseModel):

    budget: StrictFloat
    
    class Config:
        schema_extra = {
            "example": {
                "budget": None
            }
        }
        
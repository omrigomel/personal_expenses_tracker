from typing import Optional

#from click import password_option
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from DataBase.database import SessionLocal
from pydantic import BaseModel
from datetime import date, timedelta, datetime
from DataBase.DBmodels import Expense, MonthlyBudget, User
from sqlalchemy import func , and_ , cast , String , or_
import calendar
from sqlalchemy.sql import extract
from dateutil.relativedelta import relativedelta
from utiles import validate_password_strength
#from app.models import Budget
from security import hash_password, verify_password
from fastapi import Body

app_routes = APIRouter()


# create session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



class ExpenseCreate(BaseModel):
    date: date
    category: str
    description: str
    amount: float
    user_id: Optional[int] = None


class BudgetCreate(BaseModel):
    year: int
    month: int
    budget: float
    user_id: Optional[int] = None


class LoginRequest(BaseModel):
    username: str
    password: str

class LoginSchema(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    fullname: str
    email: str
    password: str

class DeleteUserSchema(BaseModel):
    username: str
    email: str
    password: str

# POST: create new expense
@app_routes.post("/expenses/")
def add_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    if not expense.user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
        
    if expense.amount <0:
        raise HTTPException (status_code=400, detail="Amount must be positive")

    new_expense = Expense(
        date=expense.date,
        category=expense.category,
        description=expense.description,
        amount=expense.amount,
        user_id=expense.user_id
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return {"message": "Expense added successfully", "expense": new_expense}


# GET: all expenses
@app_routes.get("/expenses/")
def get_all_expenses(db: Session = Depends(get_db)):
    expenses = db.query(Expense).all()
    return {"expenses": expenses}


# PUT: update expense by ID
@app_routes.put("/expenses/{expense_id}")
def update_expense(expense_id: int, updated_expense: ExpenseCreate, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter_by(id=expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    expense.date = updated_expense.date
    expense.category = updated_expense.category
    expense.description = updated_expense.description
    expense.amount = updated_expense.amount

    db.commit()
    db.refresh(expense)
    return {"message": "Expense updated successfully", "updated_expense": expense}


# DELETE: delete expense by ID
@app_routes.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter_by(id=expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully", "deleted_expense": expense}


# GET: total expenses
@app_routes.get("/expenses/total_by_category/")
def get_total_by_category(category: str, db: Session = Depends(get_db), user_id: int = 1):
    total_amount = (
        db.query(func.sum(Expense.amount))  # שימוש ב-func.sum כדי לחשב את הסכום
        .filter_by(category=category, user_id=user_id)
        .scalar()  # מחזיר את הערך הסקלרי (התוצאה)
    )
    if total_amount is None:
        total_amount = 0.0
    return {"category": category, "total_amount": total_amount}


# GET: 5 recent expenses
@app_routes.get("/expenses/recent/{username}")
def get_recent_expenses(username: str, db: Session = Depends(get_db)):
    # בדוק אם המשתמש קיים
    user = db.query(User).filter_by(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # שלוף את 5 ההוצאות האחרונות לפי ID בסדר יורד
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user.id)
        .order_by(Expense.id.desc())  # סדר לפי ID מהגדול לקטן
        .limit(5)
        .all()
    )

    return [
        {
            "date": expense.date,
            "category": expense.category,
            "description": expense.description,
            "amount": expense.amount,
        }
        for expense in expenses
    ]

#get income and expenses
@app_routes.get("/expenses/period/{period}")
def get_expenses_by_period(period: str, username: str = Query(...), db: Session = Depends(get_db)):
    # תומך רק ב-last6Months
    if period != "last6Months":
        raise HTTPException(status_code=400, detail="Only 'last6Months' is supported.")

    today = date.today()

    start_date = today.replace(day=1) - relativedelta(months=5)
    months_range = 6


    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    expenses = (
        db.query(
            func.date_format(Expense.date, "%Y-%m").label("month"),
            func.sum(Expense.amount).label("spent")
        )
        .filter(Expense.user_id == user.id, Expense.date >= start_date)
        .group_by(func.date_format(Expense.date, "%Y-%m"))
        .all()
    )
    budgets = (
        db.query(MonthlyBudget.year, MonthlyBudget.month, MonthlyBudget.budget)
        .filter(
            MonthlyBudget.user_id == user.id,
            or_(
                and_(
                    MonthlyBudget.year == today.year,
                    MonthlyBudget.month <= today.month
                ),
                MonthlyBudget.year == today.year - 1
            )
        )
        .all()
    )
    print("Budgets fetched from database:")
    for budget in budgets:
        print(f"Year: {budget.year}, Month: {budget.month}, Budget: {budget.budget}")
    budgets_dict = {
        f"{b.year}-{b.month:02d}": b.budget for b in budgets
    }
    result = []
    for i in range(months_range):
        target_date = today.replace(day=1) - relativedelta(months=i)
        target_month = target_date.strftime("%Y-%m")
        spent = next((e.spent for e in expenses if e.month == target_month), 0)
        budget = budgets_dict.get(target_month, 0)
        result.append({"month": target_month, "spent": spent, "budget": budget})

    return result



#get expenses by period detailed
@app_routes.get("/expenses/period_detailed2/{period}")
def get_expenses_period_detailed2(period: str, username: str = Query(...), db: Session = Depends(get_db)):
    from datetime import date, timedelta
    from dateutil.relativedelta import relativedelta

    today = date.today()


    if period == "currentDay":

        start_date = today
        end_date = today
    elif period == "currentMonth":
        start_date = today.replace(day=1)
        end_date = None
    elif period == "last6Months":
        start_date = today.replace(day=1) - timedelta(days=30 * 5)
        end_date = None
    elif period == "lastYear":
        start_date = today.replace(day=1) - timedelta(days=30 * 11)
        end_date = None
    else:
        raise HTTPException(status_code=400, detail="Invalid period")


    user = db.query(User).filter_by(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")


    if period == "currentDay":

        expenses = (
            db.query(Expense)
            .filter(
                Expense.user_id == user.id,
                Expense.date == start_date
            )
            .order_by(Expense.date.desc())
            .all()
        )
    else:

        expenses = (
            db.query(Expense)
            .filter(
                Expense.user_id == user.id,
                Expense.date >= start_date
            )
            .order_by(Expense.date.desc())
            .all()
        )


    result = []
    for e in expenses:
        result.append({
            "id": e.id,
            "date": e.date.isoformat(),
            "category": e.category,
            "description": e.description,
            "amount": e.amount,
            "user_id": e.user_id,
        })

    return {"expenses": result}



#monthly expenses breakdown
@app_routes.get("/expenses/monthly/{username}")
def get_monthly_expenses(username: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")


    current_month = datetime.now().month
    current_year = datetime.now().year


    expenses = (
        db.query(Expense)
        .filter(
            Expense.user_id == user.id,
            extract("month", Expense.date) == current_month,
            extract("year", Expense.date) == current_year,
        )
        .all()
    )


    total = sum(expense.amount for expense in expenses)
    breakdown = {}
    for expense in expenses:
        breakdown[expense.category] = breakdown.get(expense.category, 0) + expense.amount

    return {"total": total, "breakdown": breakdown}





# POST: create new budget
@app_routes.post("/budgets/")
def add_budget(budget: BudgetCreate, db: Session = Depends(get_db)):

    user_id = budget.user_id if budget.user_id else 1

    default_user = db.query(User).filter(User.id == user_id).first()
    if not default_user:
        default_user = User(
            id=user_id,
            username="default_user",
            fullname="Default user",
            email="default@domain.com",
            password="default_password"
        )
        db.add(default_user)
        db.commit()
        db.refresh(default_user)

    new_budget = MonthlyBudget(
        year=budget.year,
        month=budget.month,
        budget=budget.budget,
        user_id=user_id
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return {"message": "Budget added successfully", "budget": new_budget}



@app_routes.get("/budget/status/")
def get_budget_status(year: int, month: int, db: Session = Depends(get_db), user_id: int = 1):

    _, last_day = calendar.monthrange(year, month)


    budget = db.query(MonthlyBudget).filter_by(year=year, month=month, user_id=user_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found for the specified month and year")


    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .filter(Expense.date.between(f"{year}-{month:02d}-01", f"{year}-{month:02d}-{last_day}"))
        .all()
    )
    total_expenses = sum(expense.amount for expense in expenses)
    remaining_budget = budget.budget - total_expenses

    return {
        "year": year,
        "month": month,
        "monthly_budget": budget.budget,
        "total_expenses": total_expenses,
        "remaining_budget": remaining_budget
    }




#front side
# POST: create new user
@app_routes.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    if not validate_password_strength(user.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 chars with at least one uppercase letter."
        )

    #hash the password
    hashed_pass = hash_password(user.password)

    new_user = User(
        username=user.username,
        fullname=user.fullname,
        email=user.email,
        password=hashed_pass,  #crypy password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created", "user": new_user}


# DELETE: delete user
@app_routes.delete("/users/")
def delete_user(data: DeleteUserSchema, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.username == data.username,
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully", "user": {"username": data.username, "email": data.email}}


@app_routes.post("/login/")
def login(user: LoginSchema, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")


    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {
        "id": db_user.id,
        "username": db_user.username,
        "fullname": db_user.fullname,
        "email": db_user.email,
    }

@app_routes.post("/logout/")
def logout():

    #use local storage for front side
    #only to check that the user is log out
    return {"message": "Logged out successfully"}


@app_routes.put("/users/update-profile/{user_id}")
def update_user_profile(user_id: int, fullname: str, username: str, email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # unique username
    existing_username = db.query(User).filter(User.username == username, User.id != user_id).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username is already in use by another user")

    # unique email
    existing_email = db.query(User).filter(User.email == email, User.id != user_id).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email is already in use by another user")


    user.fullname = fullname
    user.username = username
    user.email = email
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully", "user": user}




@app_routes.put("/users/update-password/{user_id}")
def update_password(
    user_id: int,
    old_password: str = Body(...),
    new_password: str = Body(...),
    confirm_password: str = Body(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    #check old password
    if not verify_password(old_password, user.password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    #check new password and confirm password
    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirmation do not match")

    #validate password strength
    if not validate_password_strength(new_password):
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters long and contain at least one uppercase letter"
        )

    #hash the new password
    hashed_new = hash_password(new_password)
    user.password = hashed_new
    db.commit()
    db.refresh(user)
    return {"message": "Password updated successfully"}
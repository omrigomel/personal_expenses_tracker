import os
import sys
from datetime import date
from fastapi.testclient import TestClient
import pytest

# Add the project root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set the DATABASE_URL environment variable so that the app uses the test database
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

# Import the test database settings (engine, TestingSessionLocal, Base)
from DB_TEST import engine, TestingSessionLocal, Base

# Import the models for testing (using the test version from DBMODELS_TEST.py)
from tests import DBMODELS_TEST

# Override the get_db dependency for all endpoints (including recovery)
from app.routes import get_db
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import the FastAPI application and apply the dependency override
from app.main import app
app.dependency_overrides[get_db] = override_get_db

# Initialize the TestClient
client = TestClient(app)

# Fixture to reset the database by dropping and recreating all tables before each test
@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

# Fixture to create a default user with valid values (to prevent NOT NULL/UNIQUE issues)
@pytest.fixture(autouse=True)
def create_default_user():
    from tests.DBMODELS_TEST import User  # Import the User model from the test models
    db = TestingSessionLocal()
    try:
        user = User(
            username="default_user",
            fullname="Default User",
            password="default_password",
            email="default@test.com"
        )
        db.add(user)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
    yield

# ------------------- Integration Tests -------------------

def test_full_flow():
    # 1. Create a new user
    user_payload = {
        "username": "integration_user",
        "fullname": "Integration User",
        "email": "integration@test.com",
        "password": "Password123"
    }
    resp = client.post("/users/", json=user_payload)
    assert resp.status_code == 200, resp.text
    user = resp.json()["user"]

    # 2. Add an expense for this user
    expense_payload = {
        "date": str(date.today()),
        "category": "food",
        "description": "Lunch",
        "amount": 15.5,
        "user_id": user["id"]
    }
    resp = client.post("/expenses/", json=expense_payload)
    assert resp.status_code == 200, resp.text
    expense = resp.json()["expense"]
    assert expense["description"] == "Lunch"

    # 3. Create a budget for the user
    budget_payload = {
        "year": 2025,
        "month": 2,
        "budget": 500.0,
        "user_id": user["id"]
    }
    resp = client.post("/budgets/", json=budget_payload)
    assert resp.status_code == 200, resp.text
    budget = resp.json()["budget"]

    # 4. Retrieve the total expenses for category "food"
    resp = client.get("/expenses/total_by_category/", params={"category": "food"})
    assert resp.status_code == 200, resp.text
    total_data = resp.json()
    assert total_data["total_amount"] == 15.5

    # 5. Get the budget status
    resp = client.get("/budget/status/", params={"year": 2025, "month": 2, "user_id": user["id"]})
    assert resp.status_code == 200, resp.text
    status_data = resp.json()
    assert status_data["monthly_budget"] == 500.0
    assert status_data["total_expenses"] == 15.5
    assert status_data["remaining_budget"] == 484.5

    # 6. Update the expense
    update_payload = {
        "date": str(date.today()),
        "category": "food",
        "description": "Dinner",
        "amount": 20.0,
        "user_id": user["id"]
    }
    expense_id = expense["id"]
    resp = client.put(f"/expenses/{expense_id}", json=update_payload)
    assert resp.status_code == 200, resp.text
    updated_expense = resp.json()["updated_expense"]
    assert updated_expense["description"] == "Dinner"

    # 7. Delete the expense
    resp = client.delete(f"/expenses/{expense_id}")
    assert resp.status_code == 200, resp.text
    deleted_expense = resp.json()["deleted_expense"]
    assert deleted_expense["id"] == expense_id

    # 8. Delete the user
    delete_payload = {
        "username": user["username"],
        "email": user["email"],
        "password": user_payload["password"]
    }
    resp = client.request("DELETE", "/users/", json=delete_payload)
    assert resp.status_code == 200, resp.text
    message = resp.json()["message"]
    assert "User deleted successfully" in message

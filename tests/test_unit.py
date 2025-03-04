import os
import sys
import pytest
from fastapi.testclient import TestClient
from datetime import date
from unittest.mock import patch

# Add the project root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set the DATABASE_URL environment variable so that the original code uses the test database
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

# Import definitions from DB_TEST.py (which contains engine, TestingSessionLocal, and Base)
from DB_TEST import engine, TestingSessionLocal, Base

# Import the test models (the duplicated models from DBMODELS_TEST.py)
from tests import DBMODELS_TEST

# Override get_db using FastAPI dependency_overrides.
# Assume get_db is defined in app/routes.py – update the path as needed.
from app.routes import get_db
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import the FastAPI app and set dependency overrides
from app.main import app
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# Fixture to reset the database: drop and create all tables before each test.
@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

# Fixture to create a default user with valid values (to avoid NOT NULL/UNIQUE issues)
@pytest.fixture(autouse=True)
def create_default_user():
    from tests.DBMODELS_TEST import User  # Import User model from DBMODELS_TEST.py
    db = TestingSessionLocal()
    try:
        # Create a default user with valid values
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

# ----------------------------------------------------------------------------
# Examples for testing the Expenses endpoints
# ----------------------------------------------------------------------------

def test_add_expense_success():
    payload = {
        "date": str(date.today()),
        "category": "food",
        "description": "Pizza",
        "amount": 50.5,
        "user_id": 1
    }
    response = client.post("/expenses/", json=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert "expense" in data
    assert data["expense"]["category"] == "food"
    assert data["expense"]["amount"] == 50.5
    assert data["expense"].get("id") is not None

def test_add_expense_negative_amount():
    payload = {
        "date": str(date.today()),
        "category": "food",
        "description": "Invalid negative",
        "amount": -100.0,
        "user_id": 1
    }
    response = client.post("/expenses/", json=payload)
    assert response.status_code == 400

def test_add_expense_missing_user_id():
    payload = {
        "date": str(date.today()),
        "category": "food",
        "description": "No user_id",
        "amount": 20.0
    }
    response = client.post("/expenses/", json=payload)
    # If the API is expected to return an error, check for a 400 status code here.
    assert response.status_code == 400

def test_get_all_expenses():
    expense1 = {
        "date": str(date.today()),
        "category": "food",
        "description": "aaa",
        "amount": 10.0,
        "user_id": 1
    }
    expense2 = {
        "date": str(date.today()),
        "category": "transport",
        "description": "bbb",
        "amount": 20.0,
        "user_id": 1
    }
    client.post("/expenses/", json=expense1)
    client.post("/expenses/", json=expense2)
    response = client.get("/expenses/")
    assert response.status_code == 200
    data = response.json()
    assert "expenses" in data
    assert len(data["expenses"]) >= 2

def test_update_expense_not_found():
    payload = {
        "date": str(date.today()),
        "category": "food",
        "description": "update desc",
        "amount": 100.0,
        "user_id": 1
    }
    response = client.put("/expenses/99999", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Expense not found"

def test_update_expense_success():
    expense_payload = {
        "date": str(date.today()),
        "category": "food",
        "description": "original",
        "amount": 90.0,
        "user_id": 1
    }
    add_resp = client.post("/expenses/", json=expense_payload)
    assert add_resp.status_code == 200
    exp_id = add_resp.json()["expense"]["id"]

    update_payload = {
        "date": str(date.today()),
        "category": "food",
        "description": "updated desc",
        "amount": 111.0,
        "user_id": 1
    }
    response = client.put(f"/expenses/{exp_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert "updated_expense" in data
    assert data["updated_expense"]["description"] == "updated desc"

def test_delete_expense_not_found():
    response = client.delete("/expenses/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Expense not found"

def test_delete_expense_success():
    expense_payload = {
        "date": str(date.today()),
        "category": "food",
        "description": "to delete",
        "amount": 70.0,
        "user_id": 1
    }
    add_resp = client.post("/expenses/", json=expense_payload)
    assert add_resp.status_code == 200
    exp_id = add_resp.json()["expense"]["id"]
    response = client.delete(f"/expenses/{exp_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Expense deleted successfully"
    assert data["deleted_expense"]["id"] == exp_id

def test_get_total_by_category():
    expense_payload = {
        "date": str(date.today()),
        "category": "food",
        "description": "for sum",
        "amount": 123.45,
        "user_id": 1
    }
    client.post("/expenses/", json=expense_payload)
    response = client.get("/expenses/total_by_category/", params={"category": "food"})
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "food"
    assert data["total_amount"] == 123.45

# ----------------------------------------------------------------------------
# Examples for testing the Budgets endpoints
# ----------------------------------------------------------------------------

def test_add_budget_success():
    payload = {
        "year": 2025,
        "month": 2,
        "budget": 2000.0,
        "user_id": 1
    }
    response = client.post("/budgets/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Budget added successfully"
    assert data["budget"]["year"] == 2025
    assert data["budget"]["month"] == 2
    assert data["budget"]["budget"] == 2000.0

def test_get_budget_status_not_found():
    response = client.get("/budget/status/", params={"year": 2025, "month": 2, "user_id": 1})
    assert response.status_code == 404

def test_get_budget_status_success():
    budget_payload = {
        "year": 2025,
        "month": 2,
        "budget": 2000.0,
        "user_id": 1
    }
    client.post("/budgets/", json=budget_payload)
    expense_payload = {
        "date": str(date.today()),
        "category": "food",
        "description": "expense",
        "amount": 700.0,
        "user_id": 1
    }
    client.post("/expenses/", json=expense_payload)
    response = client.get("/budget/status/", params={"year": 2025, "month": 2, "user_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert data["year"] == 2025
    assert data["month"] == 2
    assert data["monthly_budget"] == 2000.0
    assert data["total_expenses"] == 700.0
    assert data["remaining_budget"] == 1300.0

# ----------------------------------------------------------------------------
# Examples for testing the Users endpoints
# ----------------------------------------------------------------------------

def test_create_user_weak_password():
    payload = {
        "username": "weakpass",
        "fullname": "Weak Pass",
        "email": "weak@test.com",
        "password": "abc"
    }
    response = client.post("/users/", json=payload)
    assert response.status_code == 400

def test_create_user_success():
    payload = {
        "username": "gooduser",
        "fullname": "Good User",
        "email": "good@test.com",
        "password": "Abcd1234"
    }
    response = client.post("/users/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User created"
    assert data["user"].get("id") is not None

def test_delete_user_not_found():
    payload = {
        "username": "noexist",
        "email": "noexist@test.com",
        "password": "Abcd1234"
    }
    response = client.request("DELETE", "/users/", json=payload)
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]

def test_delete_user_success():
    user_payload = {
        "username": "delete_me",
        "fullname": "To Delete",
        "email": "delete@test.com",
        "password": "Abcd1234"
    }
    add_resp = client.post("/users/", json=user_payload)
    assert add_resp.status_code == 200
    response = client.request("DELETE", "/users/", json=user_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "User deleted successfully"

def test_login_bad_credentials():
    payload = {"username": "nouser", "password": "WrongPass"}
    response = client.post("/login/", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid credentials"

def test_login_success():
    user_payload = {
        "username": "tester",
        "fullname": "Tester",
        "email": "tester@test.com",
        "password": "Abcd1234"
    }
    add_resp = client.post("/users/", json=user_payload)
    assert add_resp.status_code == 200
    payload = {"username": "tester", "password": "Abcd1234"}
    response = client.post("/login/", json=payload)
    if response.status_code == 400:
        pytest.fail("Expected success, got 400. Check verify_password logic if needed.")
    else:
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "tester"

def test_logout():
    response = client.post("/logout/")
    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully"

def test_update_user_profile_not_found():
    response = client.put("/users/update-profile/99999", params={
        "fullname": "New Name",
        "username": "new_user",
        "email": "new@test.com"
    })
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]

def test_update_user_profile_success():
    user_payload = {
        "username": "old_user",
        "fullname": "Old Name",
        "email": "old@test.com",
        "password": "Abcd1234"
    }
    add_resp = client.post("/users/", json=user_payload)
    assert add_resp.status_code == 200
    user_id = add_resp.json()["user"]["id"]
    response = client.put(f"/users/update-profile/{user_id}", params={
        "fullname": "New Full",
        "username": "new_user",
        "email": "new@test.com"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Profile updated successfully"

def test_update_password_incorrect_old():
    user_payload = {
        "username": "user_pass",
        "fullname": "Pass User",
        "email": "pass@test.com",
        "password": "Abcd1234"
    }
    add_resp = client.post("/users/", json=user_payload)
    assert add_resp.status_code == 200
    user_id = add_resp.json()["user"]["id"]
    payload = {
        "old_password": "WrongOld",
        "new_password": "Abcd9999",
        "confirm_password": "Abcd9999"
    }
    response = client.put(f"/users/update-password/{user_id}", json=payload)
    assert response.status_code == 400
    assert "Old password is incorrect" in response.json()["detail"]

def test_update_password_mismatch():
    user_payload = {
        "username": "user_pass2",
        "fullname": "Pass User2",
        "email": "pass2@test.com",
        "password": "Abcd1234"
    }
    add_resp = client.post("/users/", json=user_payload)
    assert add_resp.status_code == 200
    user_id = add_resp.json()["user"]["id"]
    payload = {
        "old_password": "Abcd1234",
        "new_password": "Abcd9999",
        "confirm_password": "DifferentPass"
    }
    response = client.put(f"/users/update-password/{user_id}", json=payload)
    assert response.status_code == 400
    assert "New password and confirmation do not match" in response.json()["detail"]

def test_update_password_weak_new():
    user_payload = {
        "username": "user_pass3",
        "fullname": "Pass User3",
        "email": "pass3@test.com",
        "password": "Abcd1234"
    }
    add_resp = client.post("/users/", json=user_payload)
    assert add_resp.status_code == 200
    user_id = add_resp.json()["user"]["id"]
    payload = {
        "old_password": "Abcd1234",
        "new_password": "abc",
        "confirm_password": "abc"
    }
    response = client.put(f"/users/update-password/{user_id}", json=payload)
    assert response.status_code == 400
    assert "must be at least 8 characters" in response.json()["detail"]

def test_update_password_success():
    user_payload = {
        "username": "user_pass4",
        "fullname": "Pass User4",
        "email": "pass4@test.com",
        "password": "Abcd1234"
    }
    add_resp = client.post("/users/", json=user_payload)
    assert add_resp.status_code == 200
    user_id = add_resp.json()["user"]["id"]
    payload = {
        "old_password": "Abcd1234",
        "new_password": "Abcd9999",
        "confirm_password": "Abcd9999"
    }
    response = client.put(f"/users/update-password/{user_id}", json=payload)
    if response.status_code == 400:
        pytest.fail("Expected success, got 400. Check verify_password logic if needed.")
    else:
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Password updated successfully"


# Personal Expense Management System

A **full-stack** solution for personal budgeting and expense tracking.  
It includes:

   1. **Backend (FastAPI)** for API endpoints, user management,   budget logic, and database access.  
   2. **Frontend (React + Tailwind CSS)** for a user-friendly interface with dashboards and graphs.  
   3. **MySQL** as the relational database.

---

## Table of Contents

1. [Overview](#overview)  
2. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)  
3. [Project Structure & File Descriptions](#project-structure--file-descriptions)  
   - [Top-Level Files](#top-level-files)  
   - [app/ (Backend)](#app-backend)  
   - [DataBase/](#database)  
   - [frontend/](#frontend)  
   - [Tests](#tests)  
4. [Technologies](#technologies)  
5. [Installation & Running with Docker Compose](#installation--running-with-docker-compose)  
6. [Usage](#usage)  
   - [Accessing the Backend](#accessing-the-backend)  
   - [Accessing the Frontend](#accessing-the-frontend)    
   - [Accessing MySQL](#accessing-mysql)  
7. [Key Endpoints](#key-endpoints)  
8. [Common Issues](#common-issues)  
9. [Contributing](#contributing)  
10. [License](#license)  
11. [API Key Note](#api-key-note)

---

## Overview

This system allows you to:

- **Manage expenses**: Create, edit, delete expenses.  
- **Set monthly budgets**: Define budgets and track spending by category.  
- **View data in periods**: Current day, month, last 6 months, or year.  
- **Authenticate**: Users can register, login, reset password, etc.  
- **Visualize**: The React frontend provides charts, tables, and interactive dashboards.

All components run in separate **Docker containers** orchestrated by **docker-compose**.

---

## Entity Relationship Diagram (ERD)

[![Excalidraw.png](https://i.postimg.cc/mD4hYZpp/Excalidraw.png)](https://postimg.cc/2qHzmYDn)


## Project Structure

 ```
C:.
|   docker-compose.yml         # Defines and orchestrates the multi-container setup
|   Dockerfile                 # Docker build instructions (commonly for backend)
|   README.md                  # Project documentation
|   requirements.txt           # Python dependencies for the backend
|   tree.txt                   # Text file containing this tree structure

+---app                        # Backend application (FastAPI)
|   |   main.py                # FastAPI entry point
|   |   models.py              # Pydantic models or placeholders
|   |   recovery.py            # Password recovery logic
|   |   routes.py              # Main routes for the backend
|   |   security.py            # Password hashing & verification
|   |   utiles.py              # Helper utilities
|   |   __init__.py            # Python package init

+---DataBase                   # Database-related code
|   |   create_tables.py       # Script to create DB tables
|   |   database.py            # SQLAlchemy engine/session
|   |   DBmodels.py            # SQLAlchemy ORM classes
|   |   __init__.py

+---frontend                   # React + Tailwind app
|   |   .gitignore
|   |   Dockerfile             # Docker build instructions for React
|   |   Excalidraw.PNG         # Diagram or design image
|   |   package-lock.json
|   |   package.json
|   |   tailwind.config.js
|   |
|   +---src
|   |   |   Account.js         # Account management page
|   |   |   AddExpense.js      # Add new expense component
|   |   |   Analysis.js        # Main analysis page
|   |   |   App.js             # Main React router
|   |   |   ChatAndRecommendations.js
|   |   |   ForgotPassword.js
|   |   |   Home.js
|   |   |   index.css
|   |   |   index.js
|   |   |   Login.js
|   |   |   MonthlyView.js
|   |   |   OpenAiChat.js
|   |   |   Register.js
|   |   |   reportWebVitals.js
|   |   |   Sidebar.js
|   |   |   UserContext.js
|   |   |
|   |   +---.idea
|   |   |       .gitignore
|   |   |       modules.xml
|   |   |       src.iml
|   |   |       workspace.xml
|   |   |
|   |   \---Connectors
|   |           AnalystRecommendations.js
|   |           api.js
|   |           ExternalAPI.js
|   |           OpenAIAPI.js
|   |
|   \---tests
|           .gitignore
|           test_unit.py
|           __init__.py


 ```



### Top-Level Files
- **docker-compose.yml**: Defines the multi-container setup:
  - `db` (MySQL)
  - `backend` (FastAPI)
  - `frontend` (React)
- **Dockerfile**: Instructions to build the backend container (Python).
- **requirements.txt**: Python dependencies for the backend (FastAPI, SQLAlchemy, PyMySQL, etc.).
- **README.md**: This documentation.

### `app/` (Backend)
- **main.py**  
  - The entry point for the main FastAPI application.  
  - Initializes the app, includes routers (`routes.py`, `recovery.py`), sets CORS, and runs `create_tables()`.

- **routes.py**  
  - Core API endpoints (e.g., `/expenses/`, `/users/`, `/login/`).  
  - Contains logic for adding/updating/deleting expenses, budgets, and user data.

- **recovery.py**  
  - Password recovery logic (sending emails with a recovery code).  
  - Depends on `User` model from the DB, plus SMTP usage.

- **security.py**  
  - Password hashing/verification using Passlib.

- **utiles.py**  
  - Misc. helper functions (e.g., `validate_password_strength`).

- **models.py**  
  - Potentially a Pydantic models file for request/response schemas (some usage may be partial if also using `DBmodels.py`).

### `DataBase/`
- **database.py**  
  - Defines `engine = create_engine(...)` with MySQL connection via `pymysql`.
  - `SessionLocal` for SQLAlchemy sessions.
  - `Base = declarative_base()` for model definitions.

- **DBmodels.py**  
  - SQLAlchemy ORM classes: `User`, `Expense`, `MonthlyBudget` with columns, relationships, etc.

- **create_tables.py**  
  - A standalone script that calls `Base.metadata.create_all(bind=engine)` to create tables.

### `frontend/` (React)
- **Dockerfile**  
  - Builds the frontend container using Node.js, installs dependencies, runs `npm start`.
- **package.json / package-lock.json**  
  - All React, Tailwind, and other JS dependencies.
- **tailwind.config.js**  
  - Tailwind CSS configuration (purge paths, theme, etc.).
- **public/**  
  - Static assets (favicon, `index.html`, logos, etc.).
- **src/**  
  - **index.js**: React entry point.
  - **App.js**: Main router (React Router) for different pages.
  - **Home.js**, **Analysis.js**, **MonthlyView.js**, etc.: Page components for the UI.
  - **ForgotPassword.js**, **Register.js**, **Login.js**: Authentication flows.
  - **Sidebar.js**, **Account.js**, **AddExpense.js**: Additional components.
  - **Connectors/**  
    - **api.js**: Functions to call the backend (`fetch`, etc.).  
    - **OpenAIAPI.js**: Example usage for ChatGPT-like requests.  
    - **AnalystRecommendations.js**: Pulling data from external APIs.  
    - **ExternalAPI.js**: Possibly for stocks or external data.
  - **UserContext.js**: React Context for storing the user object globally.
  - **index.css**: Tailwind and global styles.

### Tests
- **tests/**  
  ### Unit Tests

To run the unit tests, use the following command:

```bash
python -m pytest test_unit.py
```
### Integration  Tests

To run the Integration tests, use the following command:

```bash
python -m pytest integration_test.py
```
---

## Technologies

- **Backend**: FastAPI, SQLAlchemy, PyMySQL, Passlib  
- **Frontend**: React, Tailwind CSS    
- **Database**: MySQL 8  
- **Docker Compose**: Orchestrates multi-container setup  

---

## Installation & Running with Docker Compose

1. **Clone the repository**:
   ```bash
   git clone https://github.com/EASS-HIT-PART-A-2024-CLASS-VI/personal-expneses-OmriGomel
   cd personal-expeneses

2. **Build and start containers:**
   ```bash
   docker-compose up --build

3.
## Containers:

- **db** (MySQL): Exposed on port 3306.
- **backend** (FastAPI): Exposed on port 8000.
- **frontend** (React): Exposed on port 3000.


## Usage
- **Accessing the Backend** :
   Default at http://localhost:8000.
   Auto-generated docs at http://localhost:8000/docs (Swagger UI).
- **Accessing the Frontend**
   Default at http://localhost:3000.
   Main app with login, registration, expense management,      charts,    etc.
- **Accessing MySQL**
   **Either via:**

      docker exec -it expense-db mysql -u root -p
      # password is 'password' (per docker-compose.yml)


**Or any external MySQL client:**
  - Host: localhost
  - Port: 3306
  - User: root
  - Password: password
  - Database: expenses_db


## Key Endpoints
- **POST** /login/ — User login
- **POST** /users/ — Create new user
- **POST** /expenses/ — Add new expense
- **GET** /expenses/ — Retrieve all expenses
- **GET** /expenses/recent/{username} — Last 5 expenses for a user
- **POST** /budgets/ — Define monthly budget

## API Key Note
- **Note: The OpenAI API key Finnhub API key are included in the code for personal and non-commercial use only. If you plan to use this project in a commercial context, please remove the keys or handle them securely via environment variables or a secrets manager.**


## Demo Video
[![Watch the video](https://img.youtube.com/vi/_5tFXJQIzi4/0.jpg)](https://www.youtube.com/watch?v=_5tFXJQIzi4)
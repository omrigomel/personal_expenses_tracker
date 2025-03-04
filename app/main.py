from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from recovery import recovery_router
from routes import app_routes
from DataBase.DBmodels import Expense, User, MonthlyBudget
from DataBase.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    retries = 5
    while retries:
        try:
            Base.metadata.create_all(bind=engine)
            print("Tables created successfully!")
            yield  # פעולה אחרי שהשרת עולה
            break
        except sqlalchemy.exc.OperationalError:
            print("Database not ready, waiting 5 seconds...")
            time.sleep(5)
            retries -= 1
    else:
        print("Could not connect to the database after several attempts.")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(app_routes)
app.include_router(recovery_router)

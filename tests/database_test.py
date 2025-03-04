from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# הגדרה של SQLite בזיכרון – כל הנתונים קיימים רק במהלך ההרצה
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

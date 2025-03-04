from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from tests.DBMODELS_TEST import Base  # מייבאים את Base מהקובץ DBMODELS_TEST.py

# נגדיר בסיס נתונים קובצי עבור בדיקות (test.db)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# יצירת הטבלאות – אם הן לא קיימות כבר
Base.metadata.create_all(bind=engine)

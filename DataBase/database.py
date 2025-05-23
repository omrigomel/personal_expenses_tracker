from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os


DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@db/expenses_db")
engine = create_engine(DATABASE_URL, echo=True)



SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


Base = declarative_base()

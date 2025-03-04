# create_tables.py
from database import Base, engine
from DBmodels import User, Expense, MonthlyBudget

# Create all tables in the database
Base.metadata.create_all(bind=engine)

print("Tables created successfully!")

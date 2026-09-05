from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
from dotenv import load_dotenv
import os

#URL      → address
#Engine   → connection manager knows how to connect our Python application to PostgreSQL.
#Session  → conversation with DB

# Load variables from .env
load_dotenv()

# Get the database URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(
    autocommit = False,
    autoflush = False,
    bind = engine
)
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


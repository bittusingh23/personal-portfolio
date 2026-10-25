
from pathlib import Path
from typing import Generator

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy import create_engine, String, Text, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, Session
from sqlalchemy.sql import func

# Project folders
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
IMAGE_DIR = BASE_DIR / "image"

# SQLite database file in project root
DATABASE_URL = f"sqlite:///{(BASE_DIR / 'portfolio.db').as_posix()}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


# Database model base
class Base(DeclarativeBase):
    pass


# Contact messages table
class ContactMessageDB(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    subject: Mapped[str] = mapped_column(String(120), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


# Create database and table automatically
Base.metadata.create_all(bind=engine)


# FastAPI app
app = FastAPI(
    title="Bittu Kumar Singh Portfolio",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Verify folders
if not FRONTEND_DIR.is_dir():
    raise RuntimeError(f"Frontend folder not found: {FRONTEND_DIR}")

if not IMAGE_DIR.is_dir():
    raise RuntimeError(f"Image folder not found: {IMAGE_DIR}")


# Serve CSS and JavaScript
app.mount(
    "/static",
    StaticFiles(directory=str(FRONTEND_DIR)),
    name="static",
)

# Serve profile photos
app.mount(
    "/image",
    StaticFiles(directory=str(IMAGE_DIR)),
    name="images",
)


# Request validation model
class ContactMessage(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    subject: str = Field(min_length=2, max_length=120)
    message: str = Field(min_length=10, max_length=3000)


# Database session dependency
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Home page
@app.get("/", include_in_schema=False)
async def home():
    return FileResponse(FRONTEND_DIR / "index.html")


# Backend status
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "message": "Portfolio backend is running",
        "database": "SQLite",
    }


# Portfolio content
@app.get("/api/portfolio")
async def portfolio():
    return {
        "name": "Bittu Kumar Singh",
        "headline": "BCA Student | Python Developer | AI/ML Learner",
        "intro": (
            "I love building real-world projects, learning new "
            "technologies and turning ideas into useful solutions."
        ),
        "skills": [
            {"name": "Python", "icon": "🐍"},
            {"name": "HTML", "icon": "🌐"},
            {"name": "CSS", "icon": "🎨"},
            {"name": "JavaScript", "icon": "⚡"},
            {"name": "FastAPI", "icon": "🚀"},
            {"name": "Git", "icon": "🔀"},
            {"name": "GitHub", "icon": "🐙"},
            {"name": "VS Code", "icon": "💻"},
        ],
        "projects": [
            {
                "title": "Resto - Food Delivery Website",
                "technologies": ["HTML", "CSS", "JavaScript"],
            },
            {
                "title": "AI Flashcard Generator",
                "technologies": ["Python", "FastAPI", "JavaScript"],
            },
        ],
    }


# Save contact form message to SQLite
@app.post("/api/contact")
async def contact(
    data: ContactMessage,
    db: Session = Depends(get_db),
):
    new_message = ContactMessageDB(
        name=data.name.strip(),
        email=str(data.email),
        subject=data.subject.strip(),
        message=data.message.strip(),
    )

    try:
        db.add(new_message)
        db.commit()
        db.refresh(new_message)

        return {
            "success": True,
            "message": f"Thank you, {new_message.name}!",
            "note": "Your message has been saved successfully.",
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not save your message. Please try again.",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )

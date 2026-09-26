import enum
import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON, Text, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from db import Base

class FormStatus(enum.Enum):
    draft = "draft"
    published = "published"

class QuestionType(enum.Enum):
    short_text = "short_text"
    long_text = "long_text"
    multiple_choice = "multiple_choice"
    dropdown = "dropdown"
    email = "email"
    number = "number"
    yes_no = "yes_no"
    legal = "legal"
    rating = "rating"
    phone_number = "phone_number"
    address = "address"
    website = "website"
    picture_choice = "picture_choice"
    checkbox = "checkbox"
    net_promoter_score = "net_promoter_score"
    opinion_scale = "opinion_scale"
    ranking = "ranking"
    matrix = "matrix"
    contact_info = "contact_info"

class Creator(Base):
    __tablename__ = "creators"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)

    forms = relationship("Form", back_populates="creator", cascade="all, delete-orphan")

class Form(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("creators.id"), nullable=False)
    title = Column(String, nullable=False)
    status = Column(SQLEnum(FormStatus), default=FormStatus.draft, nullable=False)
    slug = Column(String, unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    creator = relationship("Creator", back_populates="forms")
    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    type = Column(SQLEnum(QuestionType), nullable=False)
    title = Column(String, nullable=False)
    help_text = Column(String, nullable=True)
    required = Column(Boolean, default=False)
    order_index = Column(Integer, nullable=False)
    options = Column(JSON, nullable=True)
    config = Column(JSON, nullable=True)

    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_questions_form_id_order_index', 'form_id', 'order_index'),
    )

class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_complete = Column(Boolean, default=False)

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("responses.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    value = Column(Text, nullable=False)

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")

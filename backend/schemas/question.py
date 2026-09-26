from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from models import QuestionType

class QuestionBase(BaseModel):
    title: str
    type: QuestionType
    help_text: Optional[str] = None
    required: bool = False
    options: Optional[List[str]] = None
    config: Optional[Dict[str, Any]] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[QuestionType] = None
    help_text: Optional[str] = None
    required: Optional[bool] = None
    options: Optional[List[str]] = None
    config: Optional[Dict[str, Any]] = None

class QuestionResponse(QuestionBase):
    id: int
    form_id: int
    order_index: int
    model_config = ConfigDict(from_attributes=True)

class ReorderQuestions(BaseModel):
    question_ids: List[int]

from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from models import FormStatus
from .question import QuestionResponse

class FormBase(BaseModel):
    title: str

class FormCreate(FormBase):
    pass

class FormUpdate(BaseModel):
    title: str

class FormResponse(FormBase):
    id: int
    creator_id: int
    status: FormStatus
    slug: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class FormListResponse(FormResponse):
    response_count: int

class FormDetailResponse(FormResponse):
    questions: List[QuestionResponse] = []

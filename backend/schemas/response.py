from pydantic import BaseModel, ConfigDict
from typing import List, Any
from datetime import datetime

class AnswerCreate(BaseModel):
    question_id: int
    value: str # Simplified as string, frontend will stringify

class ResponseCreate(BaseModel):
    answers: List[AnswerCreate]

class AnswerResponse(BaseModel):
    id: int
    question_id: int
    value: str
    question_title: str
    model_config = ConfigDict(from_attributes=True)

class ResponseDetail(BaseModel):
    id: int
    form_id: int
    submitted_at: datetime
    is_complete: bool
    answers: List[AnswerResponse]
    model_config = ConfigDict(from_attributes=True)

class ResponseList(BaseModel):
    id: int
    form_id: int
    submitted_at: datetime
    is_complete: bool
    model_config = ConfigDict(from_attributes=True)

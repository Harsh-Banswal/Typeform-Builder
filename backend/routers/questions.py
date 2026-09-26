from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse, ReorderQuestions
from crud import question as crud_question
from crud import form as crud_form

router = APIRouter(tags=["questions"])

@router.post("/forms/{form_id}/questions", response_model=QuestionResponse)
def create_question(form_id: int, question: QuestionCreate, db: Session = Depends(get_db)):
    db_form = crud_form.get_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud_question.create_question(db, form_id, question)

@router.patch("/questions/{question_id}", response_model=QuestionResponse)
def update_question(question_id: int, question: QuestionUpdate, db: Session = Depends(get_db)):
    db_q = crud_question.update_question(db, question_id, question)
    if not db_q:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_q

@router.delete("/questions/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    db_q = crud_question.delete_question(db, question_id)
    if not db_q:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted"}

@router.put("/forms/{form_id}/questions/reorder")
def reorder_questions(form_id: int, reorder: ReorderQuestions, db: Session = Depends(get_db)):
    db_form = crud_form.get_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    crud_question.reorder_questions(db, form_id, reorder)
    return {"message": "Questions reordered"}

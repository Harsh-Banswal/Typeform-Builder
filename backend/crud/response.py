from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Form, Response as FormResponseModel, Answer, Question, QuestionType
from schemas.response import ResponseCreate
import re
from fastapi import HTTPException

def get_responses(db: Session, form_id: int):
    return db.query(FormResponseModel).filter(FormResponseModel.form_id == form_id).all()

def get_response(db: Session, response_id: int):
    db_res = db.query(FormResponseModel).filter(FormResponseModel.id == response_id).first()
    if db_res:
        for a in db_res.answers:
            a.question_title = a.question.title
    return db_res

def submit_response(db: Session, form_id: int, response_data: ResponseCreate):
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    questions = {q.id: q for q in form.questions}
    
    answers_to_create = []
    
    submitted_q_ids = {a.question_id for a in response_data.answers}
    for q in form.questions:
        if q.required and q.id not in submitted_q_ids:
            raise HTTPException(status_code=422, detail=[{"loc": ["body", "answers", str(q.id)], "msg": "Field is required", "type": "value_error"}])
            
    for a in response_data.answers:
        q = questions.get(a.question_id)
        if not q:
            raise HTTPException(status_code=422, detail=[{"loc": ["body", "answers", str(a.question_id)], "msg": "Invalid question ID", "type": "value_error"}])
            
        val = a.value
        if q.type == QuestionType.email:
            if not re.match(r"[^@]+@[^@]+\.[^@]+", val):
                raise HTTPException(status_code=422, detail=[{"loc": ["body", "answers", str(a.question_id)], "msg": "Invalid email format", "type": "value_error"}])
        elif q.type == QuestionType.number:
            try:
                float(val)
            except ValueError:
                raise HTTPException(status_code=422, detail=[{"loc": ["body", "answers", str(a.question_id)], "msg": "Must be a number", "type": "value_error"}])
        elif q.type in [QuestionType.multiple_choice, QuestionType.dropdown]:
            if q.options and val not in q.options:
                raise HTTPException(status_code=422, detail=[{"loc": ["body", "answers", str(a.question_id)], "msg": "Invalid choice", "type": "value_error"}])
        
        answers_to_create.append(Answer(question_id=q.id, value=val))
        
    db_response = FormResponseModel(form_id=form_id, is_complete=True)
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    
    for ans in answers_to_create:
        ans.response_id = db_response.id
        db.add(ans)
        
    db.commit()
    return db_response.id

def get_form_stats(db: Session, form_id: int):
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        return []

    result = []
    for q in form.questions:
        answers = db.query(Answer).filter(Answer.question_id == q.id).all()
        non_empty = [a for a in answers if a.value and a.value.strip()]
        q_stat = {
            "question_id": q.id,
            "question_title": q.title or "Untitled Question",
            "type": q.type.value,
            "response_count": len(non_empty),
        }

        if q.type in [QuestionType.multiple_choice, QuestionType.dropdown, QuestionType.yes_no, QuestionType.legal]:
            counts = {}
            for a in non_empty:
                counts[a.value] = counts.get(a.value, 0) + 1
            q_stat["frequencies"] = counts
            q_stat["average"] = None
            q_stat["min"] = None
            q_stat["max"] = None

        elif q.type in [QuestionType.number, QuestionType.rating]:
            vals = []
            for a in non_empty:
                try:
                    vals.append(float(a.value))
                except Exception:
                    pass
            q_stat["average"] = round(sum(vals) / len(vals), 2) if vals else None
            q_stat["min"] = min(vals) if vals else None
            q_stat["max"] = max(vals) if vals else None
            q_stat["frequencies"] = {}
        else:
            q_stat["frequencies"] = {}
            q_stat["average"] = None
            q_stat["min"] = None
            q_stat["max"] = None

        result.append(q_stat)

    return result

import csv
import io

def export_responses_csv(db: Session, form_id: int) -> str:
    form = db.query(Form).filter(Form.id == form_id).first()
    if not form:
        return ""
    
    questions = form.questions
    q_titles = [q.title for q in questions]
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    header = ["Response ID", "Submitted At"] + q_titles
    writer.writerow(header)
    
    responses = db.query(FormResponseModel).filter(FormResponseModel.form_id == form_id).all()
    for r in responses:
        row = [r.id, r.submitted_at.isoformat()]
        ans_map = {a.question_id: a.value for a in r.answers}
        for q in questions:
            row.append(ans_map.get(q.id, ""))
        writer.writerow(row)
        
    return output.getvalue()

from sqlalchemy.orm import Session
from models import Question
from schemas.question import QuestionCreate, QuestionUpdate, ReorderQuestions

def create_question(db: Session, form_id: int, question: QuestionCreate):
    max_order = db.query(Question).filter(Question.form_id == form_id).order_by(Question.order_index.desc()).first()
    order_index = (max_order.order_index + 1) if max_order else 0
    
    db_question = Question(
        form_id=form_id,
        title=question.title,
        type=question.type,
        help_text=question.help_text,
        required=question.required,
        order_index=order_index,
        options=question.options,
        config=question.config
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def update_question(db: Session, question_id: int, question: QuestionUpdate):
    db_q = db.query(Question).filter(Question.id == question_id).first()
    if db_q:
        update_data = question.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_q, key, value)
        db.commit()
        db.refresh(db_q)
    return db_q

def delete_question(db: Session, question_id: int):
    db_q = db.query(Question).filter(Question.id == question_id).first()
    if db_q:
        db.delete(db_q)
        db.commit()
    return db_q

def reorder_questions(db: Session, form_id: int, reorder: ReorderQuestions):
    questions = db.query(Question).filter(Question.form_id == form_id).all()
    q_map = {q.id: q for q in questions}
    
    for idx, q_id in enumerate(reorder.question_ids):
        if q_id in q_map:
            q_map[q_id].order_index = idx
            
    db.commit()
    return True

import sys
import os
from sqlalchemy.orm import Session
from db import SessionLocal, Base, engine
from models import Creator, Form, FormStatus, Question, QuestionType, Response, Answer
from nanoid import generate
import datetime

def seed():
    # Make sure all tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Default Creator
    creator = db.query(Creator).filter(Creator.id == 1).first()
    if not creator:
        creator = Creator(id=1, name="Demo Creator", email="demo@example.com")
        db.add(creator)
        db.commit()
        db.refresh(creator)
    
    # Create a published form
    slug_val = generate(size=10)
    demo_form = Form(
        creator_id=creator.id,
        title="Customer Feedback Survey",
        status=FormStatus.published,
        slug=slug_val
    )
    db.add(demo_form)
    db.commit()
    db.refresh(demo_form)
    
    # Add Questions
    questions_data = [
        {"type": QuestionType.short_text, "title": "What's your name?", "order_index": 0, "required": True},
        {"type": QuestionType.rating, "title": "How would you rate our product?", "order_index": 1, "config": {"steps": 5, "shape": "star"}, "required": True},
        {"type": QuestionType.multiple_choice, "title": "Which feature do you use the most?", "order_index": 2, "options": ["Dashboard", "Reports", "Settings", "Other"], "required": False},
        {"type": QuestionType.number, "title": "How many team members use this?", "order_index": 3, "required": False},
        {"type": QuestionType.long_text, "title": "Any additional comments?", "order_index": 4, "required": False}
    ]
    
    question_objs = []
    for q_data in questions_data:
        q = Question(
            form_id=demo_form.id,
            type=q_data["type"],
            title=q_data["title"],
            order_index=q_data["order_index"],
            required=q_data["required"],
            options=q_data.get("options", []),
            config=q_data.get("config", {})
        )
        db.add(q)
        question_objs.append(q)
    
    db.commit()
    for q in question_objs:
        db.refresh(q)
    
    # Add Dummy Responses
    # Response 1
    resp1 = Response(form_id=demo_form.id, is_complete=True, submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=1))
    db.add(resp1)
    db.commit()
    db.refresh(resp1)
    
    db.add_all([
        Answer(response_id=resp1.id, question_id=question_objs[0].id, value="Alice"),
        Answer(response_id=resp1.id, question_id=question_objs[1].id, value="5"),
        Answer(response_id=resp1.id, question_id=question_objs[2].id, value="Dashboard"),
        Answer(response_id=resp1.id, question_id=question_objs[3].id, value="4"),
        Answer(response_id=resp1.id, question_id=question_objs[4].id, value="Great app! Love the new UI.")
    ])
    
    # Response 2
    resp2 = Response(form_id=demo_form.id, is_complete=True, submitted_at=datetime.datetime.utcnow() - datetime.timedelta(hours=5))
    db.add(resp2)
    db.commit()
    db.refresh(resp2)
    
    db.add_all([
        Answer(response_id=resp2.id, question_id=question_objs[0].id, value="Bob"),
        Answer(response_id=resp2.id, question_id=question_objs[1].id, value="4"),
        Answer(response_id=resp2.id, question_id=question_objs[2].id, value="Reports"),
        Answer(response_id=resp2.id, question_id=question_objs[3].id, value="2"),
        Answer(response_id=resp2.id, question_id=question_objs[4].id, value="")
    ])
    
    # Response 3
    resp3 = Response(form_id=demo_form.id, is_complete=True, submitted_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=30))
    db.add(resp3)
    db.commit()
    db.refresh(resp3)
    
    db.add_all([
        Answer(response_id=resp3.id, question_id=question_objs[0].id, value="Charlie"),
        Answer(response_id=resp3.id, question_id=question_objs[1].id, value="3"),
        Answer(response_id=resp3.id, question_id=question_objs[2].id, value="Settings"),
        Answer(response_id=resp3.id, question_id=question_objs[3].id, value="10"),
        Answer(response_id=resp3.id, question_id=question_objs[4].id, value="Needs more integrations.")
    ])
    
    db.commit()
    db.close()
    
    print(f"Database successfully seeded!")
    print(f"Sample Form ID: {demo_form.id}")
    print(f"Sample Public Link Slug: {demo_form.slug}")

if __name__ == "__main__":
    seed()

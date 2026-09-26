from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Form, FormStatus, Question, Response as FormResponseModel
from schemas.form import FormCreate, FormUpdate
from nanoid import generate

def get_forms(db: Session, creator_id: int):
    forms = db.query(Form).filter(Form.creator_id == creator_id).all()
    for form in forms:
        form.response_count = db.query(func.count(FormResponseModel.id)).filter(FormResponseModel.form_id == form.id).scalar()
    return forms

def create_form(db: Session, form: FormCreate, creator_id: int):
    db_form = Form(title=form.title, creator_id=creator_id, status=FormStatus.draft)
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

def get_form(db: Session, form_id: int):
    form = db.query(Form).filter(Form.id == form_id).first()
    if form:
        form.questions.sort(key=lambda x: x.order_index)
    return form

def update_form(db: Session, form_id: int, form: FormUpdate):
    db_form = get_form(db, form_id)
    if db_form:
        db_form.title = form.title
        db.commit()
        db.refresh(db_form)
    return db_form

def duplicate_form(db: Session, form_id: int):
    db_form = get_form(db, form_id)
    if not db_form:
        return None
    
    new_form = Form(
        title=f"{db_form.title} (Copy)",
        creator_id=db_form.creator_id,
        status=FormStatus.draft
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)
    
    for q in db_form.questions:
        new_q = Question(
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            help_text=q.help_text,
            required=q.required,
            order_index=q.order_index,
            options=q.options,
            config=q.config
        )
        db.add(new_q)
    db.commit()
    db.refresh(new_form)
    new_form.questions.sort(key=lambda x: x.order_index)
    return new_form

def delete_form(db: Session, form_id: int):
    db_form = get_form(db, form_id)
    if db_form:
        db.delete(db_form)
        db.commit()
    return db_form

def publish_form(db: Session, form_id: int):
    db_form = get_form(db, form_id)
    if db_form:
        db_form.status = FormStatus.published
        if not db_form.slug:
            db_form.slug = generate(size=10)
        db.commit()
        db.refresh(db_form)
    return db_form

def unpublish_form(db: Session, form_id: int):
    db_form = get_form(db, form_id)
    if db_form:
        db_form.status = FormStatus.draft
        db.commit()
        db.refresh(db_form)
    return db_form

def get_form_by_slug(db: Session, slug: str):
    form = db.query(Form).filter(Form.slug == slug, Form.status == FormStatus.published).first()
    if form:
        form.questions.sort(key=lambda x: x.order_index)
    return form

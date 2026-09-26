from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import get_db
from schemas.form import FormCreate, FormUpdate, FormListResponse, FormDetailResponse, FormResponse
from crud import form as crud_form

router = APIRouter(prefix="/forms", tags=["forms"])

DEFAULT_CREATOR_ID = 1

@router.get("", response_model=List[FormListResponse])
def get_forms(db: Session = Depends(get_db)):
    return crud_form.get_forms(db, creator_id=DEFAULT_CREATOR_ID)

@router.post("", response_model=FormResponse)
def create_form(form: FormCreate, db: Session = Depends(get_db)):
    return crud_form.create_form(db, form, creator_id=DEFAULT_CREATOR_ID)

@router.get("/{form_id}", response_model=FormDetailResponse)
def get_form(form_id: int, db: Session = Depends(get_db)):
    db_form = crud_form.get_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@router.patch("/{form_id}", response_model=FormResponse)
def update_form(form_id: int, form: FormUpdate, db: Session = Depends(get_db)):
    db_form = crud_form.update_form(db, form_id, form)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@router.post("/{form_id}/duplicate", response_model=FormDetailResponse)
def duplicate_form(form_id: int, db: Session = Depends(get_db)):
    db_form = crud_form.duplicate_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@router.delete("/{form_id}")
def delete_form(form_id: int, db: Session = Depends(get_db)):
    db_form = crud_form.delete_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Form deleted"}

@router.post("/{form_id}/publish", response_model=FormResponse)
def publish_form(form_id: int, db: Session = Depends(get_db)):
    db_form = crud_form.publish_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@router.post("/{form_id}/unpublish", response_model=FormResponse)
def unpublish_form(form_id: int, db: Session = Depends(get_db)):
    db_form = crud_form.unpublish_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

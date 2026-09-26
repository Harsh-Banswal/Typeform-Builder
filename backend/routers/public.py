from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from schemas.form import FormDetailResponse
from schemas.response import ResponseCreate
from crud import form as crud_form
from crud import response as crud_response

router = APIRouter(prefix="/public/forms", tags=["public"])

@router.get("/{slug}", response_model=FormDetailResponse)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    db_form = crud_form.get_form_by_slug(db, slug)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return db_form

@router.post("/{slug}/responses")
def submit_response(slug: str, response_data: ResponseCreate, db: Session = Depends(get_db)):
    db_form = crud_form.get_form_by_slug(db, slug)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    response_id = crud_response.submit_response(db, db_form.id, response_data)
    return {"id": response_id}

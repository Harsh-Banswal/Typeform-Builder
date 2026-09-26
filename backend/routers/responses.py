from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from db import get_db
from schemas.response import ResponseList, ResponseDetail
from crud import response as crud_response
from crud import form as crud_form

router = APIRouter(tags=["responses"])

@router.get("/forms/{form_id}/responses", response_model=List[ResponseList])
def get_responses(form_id: int, db: Session = Depends(get_db)):
    db_form = crud_form.get_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud_response.get_responses(db, form_id)

@router.get("/responses/{response_id}", response_model=ResponseDetail)
def get_response(response_id: int, db: Session = Depends(get_db)):
    db_res = crud_response.get_response(db, response_id)
    if not db_res:
        raise HTTPException(status_code=404, detail="Response not found")
    return db_res

@router.delete("/responses/{response_id}")
def delete_response(response_id: int, db: Session = Depends(get_db)):
    db_res = crud_response.delete_response(db, response_id)
    if not db_res:
        raise HTTPException(status_code=404, detail="Response not found")
    return {"message": "Response deleted"}

@router.get("/forms/{form_id}/stats")
def get_form_stats(form_id: int, db: Session = Depends(get_db)):
    db_form = crud_form.get_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud_response.get_form_stats(db, form_id)

from fastapi.responses import Response

@router.get("/forms/{form_id}/export")
def export_responses(form_id: int, db: Session = Depends(get_db)):
    db_form = crud_form.get_form(db, form_id)
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    csv_data = crud_response.export_responses_csv(db, form_id)
    return Response(content=csv_data, media_type="text/csv", headers={"Content-Disposition": f'attachment; filename="form_{form_id}_responses.csv"'})

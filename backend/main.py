from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from settings import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

from routers import forms, questions, public, responses
app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(public.router)
app.include_router(responses.router)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.resume_routes import router as resume_router

app = FastAPI(title="Resume Portfolio Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)
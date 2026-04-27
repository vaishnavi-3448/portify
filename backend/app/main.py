from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.resume_routes import router as resume_router

app = FastAPI(title="Resume Portfolio Generator API")

# ✅ FIXED CORS CONFIG (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://98.93.120.138:5173",  # your EC2 frontend
        "http://localhost:5173"       # for local dev (optional)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routes
app.include_router(resume_router)

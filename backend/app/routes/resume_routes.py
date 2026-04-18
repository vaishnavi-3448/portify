import os
from datetime import datetime
from fastapi import APIRouter, UploadFile, File
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.resume_parser import parse_resume_text
from app.database.mongodb import resume_collection

router = APIRouter()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.get("/")
def home():
    return {"message": "Backend is running"}

@router.post("/upload")
async def upload_resume(resume: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, resume.filename)

    with open(file_path, "wb") as f:
        content = await resume.read()
        f.write(content)

    extracted_text = extract_text_from_pdf(file_path)
    parsed_data = parse_resume_text(extracted_text)

    resume_document = {
        "resume_filename": resume.filename,
        "parsed_data": parsed_data,
        "created_at": datetime.utcnow()
    }

    inserted_result = resume_collection.insert_one(resume_document)

    return {
        "message": "File uploaded and saved to MongoDB successfully",
        "filename": resume.filename,
        "document_id": str(inserted_result.inserted_id),
        "parsed_data": parsed_data
    }
from bson import ObjectId

@router.get("/resume/{doc_id}")
def get_resume(doc_id: str):
    document = resume_collection.find_one({"_id": ObjectId(doc_id)})

    if not document:
        return {"error": "Resume not found"}

    document["_id"] = str(document["_id"])

    return document
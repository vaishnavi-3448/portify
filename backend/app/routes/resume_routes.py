import os
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, UploadFile, File, HTTPException, Body

from app.database.mongodb import resume_collection
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.resume_parser import parse_resume_text
from app.utils.helpers import generate_slug

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

    base_slug = generate_slug(parsed_data["name"])
    slug = base_slug
    counter = 1

    while resume_collection.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1

    resume_document = {
        "resume_filename": resume.filename,
        "slug": slug,
        "parsed_data": parsed_data,
        "selected_template": None,
        "published": False,
        "created_at": datetime.utcnow(),
        "deployed_at": None,
    }

    inserted_result = resume_collection.insert_one(resume_document)

    return {
        "message": "Resume uploaded successfully",
        "document_id": str(inserted_result.inserted_id),
        "slug": slug,
        "parsed_data": parsed_data,
    }


@router.get("/resume/{doc_id}")
def get_resume(doc_id: str):
    document = resume_collection.find_one({"_id": ObjectId(doc_id)})

    if not document:
        raise HTTPException(status_code=404, detail="Resume not found")

    document["_id"] = str(document["_id"])
    return document


@router.put("/resume/{doc_id}/select-template")
def select_template(doc_id: str, data: dict = Body(...)):
    template_name = data.get("template")

    if not template_name:
        raise HTTPException(status_code=400, detail="Template is required")

    result = resume_collection.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {"selected_template": template_name}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found")

    updated_document = resume_collection.find_one({"_id": ObjectId(doc_id)})
    updated_document["_id"] = str(updated_document["_id"])

    return {
        "message": "Template selected successfully",
        "document": updated_document,
    }
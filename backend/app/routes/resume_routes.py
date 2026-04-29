from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from pydantic import BaseModel
from bson import ObjectId
from bson.errors import InvalidId
import os
from datetime import datetime
from app.database.mongodb import resume_collection
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.resume_parser import parse_resume_text
from app.utils.helpers import generate_slug

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class TemplateSelection(BaseModel):
    template_name: str

@router.post("/upload")
async def upload_resume(resume: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, resume.filename)

        with open(file_path, "wb") as f:
            f.write(await resume.read())

        text = extract_text_from_pdf(file_path)
        parsed = parse_resume_text(text)

        print("Extracted text length:", len(text))
        print("Parsed data keys:", list(parsed.keys()) if parsed else "None")

        name_for_slug = parsed.get("name") or "portfolio-user"
        slug = generate_slug(name_for_slug)

        doc = {
            "slug": slug,
            "parsed_data": parsed,
            "selected_template": None,
            "published": False,
            "created_at": datetime.utcnow(),
            "deployed_at": None
        }

        result = resume_collection.insert_one(doc)

        return {
            "document_id": str(result.inserted_id)
        }

    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("{id}")
def get_resume(id: str):
    try:
        doc = resume_collection.find_one({"_id": ObjectId(id)})

        if not doc:
            raise HTTPException(status_code=404, detail="Resume not found")

        print("Fetched doc keys:", list(doc.keys()))
        print("Parsed data keys:", list(doc.get("parsed_data", {}).keys()) if doc.get("parsed_data") else "No parsed_data")

        doc["_id"] = str(doc["_id"])
        return doc

    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid resume ID")
    except Exception as e:
        print("GET RESUME ERROR:", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch resume: {str(e)}")


@router.put("{id}/select-template")
def select_template(id: str, payload: TemplateSelection = Body(...)):
    try:
        doc = resume_collection.find_one({"_id": ObjectId(id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Resume not found")

        resume_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"selected_template": payload.template_name}}
        )

        updated_doc = resume_collection.find_one({"_id": ObjectId(id)})
        if not updated_doc:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated document")
        updated_doc["_id"] = str(updated_doc["_id"])
        return updated_doc

    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid resume ID")
    except HTTPException:
        raise
    except Exception as e:
        print("SELECT TEMPLATE ERROR:", str(e))
        raise HTTPException(status_code=500, detail=f"Template selection failed: {str(e)}")


@router.put("{id}/deploy")
def deploy(id: str):
    try:
        doc = resume_collection.find_one({"_id": ObjectId(id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Resume not found")

        resume_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"published": True, "deployed_at": datetime.utcnow()}}
        )

        updated_doc = resume_collection.find_one({"_id": ObjectId(id)})
        if not updated_doc:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated document")
        return {"slug": updated_doc["slug"]}

    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid resume ID")
    except HTTPException:
        raise
    except Exception as e:
        print("DEPLOY ERROR:", str(e))
        raise HTTPException(status_code=500, detail=f"Deploy failed: {str(e)}")


@router.get("/u/{slug}")
def public_portfolio(slug: str):
    try:
        doc = resume_collection.find_one({"slug": slug, "published": True})

        if not doc:
            raise HTTPException(status_code=404, detail="Public portfolio not found")

        doc["_id"] = str(doc["_id"])
        return doc

    except Exception as e:
        print("PUBLIC PORTFOLIO ERROR:", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch public portfolio: {str(e)}")
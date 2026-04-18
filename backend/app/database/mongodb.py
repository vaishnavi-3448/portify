import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set in .env")

client = MongoClient(MONGO_URI, server_api=ServerApi("1"))
db = client[DATABASE_NAME]
resume_collection = db[COLLECTION_NAME]
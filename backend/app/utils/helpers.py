from typing import Optional
from bson import ObjectId

def is_valid_object_id(value: str) -> bool:
    """Check if string is valid MongoDB ObjectId"""
    try:
        ObjectId(value)
        return True
    except:
        return False

def convert_to_object_id(value: str) -> ObjectId:
    """Convert string to ObjectId"""
    return ObjectId(value)

def serialize_doc(doc) -> dict:
    """Serialize MongoDB document"""
    if doc is None:
        return None
    
    doc["id"] = str(doc.pop("_id", ""))
    return doc

def serialize_docs(docs) -> list:
    """Serialize list of MongoDB documents"""
    return [serialize_doc(doc) for doc in docs]

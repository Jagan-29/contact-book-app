from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pymongo import MongoClient
from datetime import datetime
from typing import List, Optional
import os
from dotenv import load_dotenv
import base64
import io
import csv
import json

from models import (
    UserRegister, UserLogin, User, ContactCreate, ContactUpdate, 
    Contact, Category, Token, PhoneNumber, EmailAddress
)
from auth import hash_password, verify_password, create_access_token, get_current_user

load_dotenv()

app = FastAPI(title="Contact Book API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "contactbook")

client = MongoClient(MONGO_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
contacts_collection = db["contacts"]
categories_collection = db["categories"]

# Create indexes
users_collection.create_index("email", unique=True)
contacts_collection.create_index("user_id")
categories_collection.create_index("user_id")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ==================== AUTH ROUTES ====================

@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if user exists
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hash_password(user_data.password)
    )
    
    user_dict = user.dict()
    users_collection.insert_one(user_dict)
    
    # Create default categories
    default_categories = ["Family", "Friends", "Work", "General"]
    colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]
    
    for cat_name, color in zip(default_categories, colors):
        category = Category(
            user_id=user.user_id,
            name=cat_name,
            color=color
        )
        categories_collection.insert_one(category.dict())
    
    # Create token
    access_token = create_access_token(data={"sub": user.user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name
        }
    }

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Find user
    user_doc = users_collection.find_one({"email": user_data.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(user_data.password, user_doc["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token(data={"sub": user_doc["user_id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user_doc["user_id"],
            "email": user_doc["email"],
            "name": user_doc["name"]
        }
    }

@app.get("/api/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user_doc = users_collection.find_one({"user_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "name": user_doc["name"]
    }

# ==================== CONTACT ROUTES ====================

@app.post("/api/contacts", status_code=status.HTTP_201_CREATED)
async def create_contact(contact_data: ContactCreate, user_id: str = Depends(get_current_user)):
    # Check for duplicates
    existing = contacts_collection.find_one({
        "user_id": user_id,
        "name": {"$regex": f"^{contact_data.name}$", "$options": "i"}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Contact with this name already exists")
    
    contact = Contact(
        user_id=user_id,
        **contact_data.dict()
    )
    
    contact_dict = contact.dict()
    contacts_collection.insert_one(contact_dict)
    
    # Remove MongoDB _id
    contact_dict.pop("_id", None)
    return contact_dict

@app.get("/api/contacts")
async def get_contacts(
    user_id: str = Depends(get_current_user),
    search: Optional[str] = None,
    category: Optional[str] = None,
    sort_by: str = Query("name", regex="^(name|created_at|updated_at)$")
):
    query = {"user_id": user_id}
    
    # Search filter
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    # Category filter
    if category:
        query["category"] = category
    
    # Sort
    sort_order = 1 if sort_by == "name" else -1
    contacts = list(contacts_collection.find(query).sort(sort_by, sort_order))
    
    # Remove MongoDB _id
    for contact in contacts:
        contact.pop("_id", None)
    
    return contacts

@app.get("/api/contacts/{contact_id}")
async def get_contact(contact_id: str, user_id: str = Depends(get_current_user)):
    contact = contacts_collection.find_one({"contact_id": contact_id, "user_id": user_id})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    contact.pop("_id", None)
    return contact

@app.put("/api/contacts/{contact_id}")
async def update_contact(
    contact_id: str,
    contact_data: ContactUpdate,
    user_id: str = Depends(get_current_user)
):
    contact = contacts_collection.find_one({"contact_id": contact_id, "user_id": user_id})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Update fields
    update_data = contact_data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    contacts_collection.update_one(
        {"contact_id": contact_id, "user_id": user_id},
        {"$set": update_data}
    )
    
    updated_contact = contacts_collection.find_one({"contact_id": contact_id, "user_id": user_id})
    updated_contact.pop("_id", None)
    return updated_contact

@app.delete("/api/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(contact_id: str, user_id: str = Depends(get_current_user)):
    result = contacts_collection.delete_one({"contact_id": contact_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return None

# ==================== CATEGORY ROUTES ====================

@app.get("/api/categories")
async def get_categories(user_id: str = Depends(get_current_user)):
    categories = list(categories_collection.find({"user_id": user_id}))
    for cat in categories:
        cat.pop("_id", None)
    return categories

@app.post("/api/categories", status_code=status.HTTP_201_CREATED)
async def create_category(name: str, color: str = "#008CBA", user_id: str = Depends(get_current_user)):
    # Check if category exists
    existing = categories_collection.find_one({"user_id": user_id, "name": name})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    category = Category(user_id=user_id, name=name, color=color)
    category_dict = category.dict()
    categories_collection.insert_one(category_dict)
    
    category_dict.pop("_id", None)
    return category_dict

@app.delete("/api/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str, user_id: str = Depends(get_current_user)):
    result = categories_collection.delete_one({"category_id": category_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return None

# ==================== FILE UPLOAD ====================

@app.post("/api/upload-profile-picture")
async def upload_profile_picture(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read and encode to base64
    contents = await file.read()
    base64_encoded = base64.b64encode(contents).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{base64_encoded}"
    
    return {"url": data_url}

# ==================== IMPORT/EXPORT ====================

@app.post("/api/contacts/import/json")
async def import_json(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    try:
        contents = await file.read()
        data = json.loads(contents)
        
        imported_count = 0
        for item in data:
            # Check if contact exists
            existing = contacts_collection.find_one({
                "user_id": user_id,
                "name": {"$regex": f"^{item.get('name', '')}$", "$options": "i"}
            })
            
            if not existing:
                contact = Contact(
                    user_id=user_id,
                    name=item.get("name", ""),
                    phones=[PhoneNumber(**p) for p in item.get("phones", [])],
                    emails=[EmailAddress(**e) for e in item.get("emails", [])],
                    category=item.get("category", "General"),
                    notes=item.get("notes", ""),
                    profile_picture=item.get("profile_picture")
                )
                contacts_collection.insert_one(contact.dict())
                imported_count += 1
        
        return {"message": f"Imported {imported_count} contacts"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file: {str(e)}")

@app.post("/api/contacts/import/csv")
async def import_csv(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    try:
        contents = await file.read()
        csv_data = contents.decode("utf-8")
        reader = csv.DictReader(io.StringIO(csv_data))
        
        imported_count = 0
        for row in reader:
            # Check if contact exists
            existing = contacts_collection.find_one({
                "user_id": user_id,
                "name": {"$regex": f"^{row.get('name', '')}$", "$options": "i"}
            })
            
            if not existing:
                phones = []
                if row.get("phone"):
                    phones.append(PhoneNumber(number=row["phone"], label="mobile"))
                
                emails = []
                if row.get("email"):
                    emails.append(EmailAddress(email=row["email"], label="personal"))
                
                contact = Contact(
                    user_id=user_id,
                    name=row.get("name", ""),
                    phones=phones,
                    emails=emails,
                    category=row.get("category", "General"),
                    notes=row.get("notes", "")
                )
                contacts_collection.insert_one(contact.dict())
                imported_count += 1
        
        return {"message": f"Imported {imported_count} contacts"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file: {str(e)}")

@app.get("/api/contacts/export/json")
async def export_json(user_id: str = Depends(get_current_user)):
    contacts = list(contacts_collection.find({"user_id": user_id}))
    
    # Remove MongoDB _id
    for contact in contacts:
        contact.pop("_id", None)
    
    json_str = json.dumps(contacts, default=str, indent=2)
    
    return StreamingResponse(
        io.BytesIO(json_str.encode()),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=contacts.json"}
    )

@app.get("/api/contacts/export/csv")
async def export_csv(user_id: str = Depends(get_current_user)):
    contacts = list(contacts_collection.find({"user_id": user_id}))
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["name", "phone", "email", "category", "notes"])
    writer.writeheader()
    
    for contact in contacts:
        phone = contact.get("phones", [{}])[0].get("number", "") if contact.get("phones") else ""
        email = contact.get("emails", [{}])[0].get("email", "") if contact.get("emails") else ""
        
        writer.writerow({
            "name": contact.get("name", ""),
            "phone": phone,
            "email": email,
            "category": contact.get("category", ""),
            "notes": contact.get("notes", "")
        })
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=contacts.csv"}
    )

# ==================== STATISTICS ====================

@app.get("/api/stats")
async def get_stats(user_id: str = Depends(get_current_user)):
    total_contacts = contacts_collection.count_documents({"user_id": user_id})
    
    # Count by category
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    by_category = list(contacts_collection.aggregate(pipeline))
    
    return {
        "total_contacts": total_contacts,
        "by_category": {item["_id"]: item["count"] for item in by_category}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

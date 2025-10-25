from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from datetime import datetime
import uuid

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PhoneNumber(BaseModel):
    number: str
    label: str = "mobile"  # mobile, home, work

class EmailAddress(BaseModel):
    email: EmailStr
    label: str = "personal"  # personal, work

class ContactCreate(BaseModel):
    name: str
    phones: List[PhoneNumber] = []
    emails: List[EmailAddress] = []
    category: Optional[str] = "General"
    notes: Optional[str] = ""
    profile_picture: Optional[str] = None

    @validator('name')
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    phones: Optional[List[PhoneNumber]] = None
    emails: Optional[List[EmailAddress]] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    profile_picture: Optional[str] = None

class Contact(BaseModel):
    contact_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    phones: List[PhoneNumber] = []
    emails: List[EmailAddress] = []
    category: str = "General"
    notes: str = ""
    profile_picture: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Category(BaseModel):
    category_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    color: str = "#008CBA"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict
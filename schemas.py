from pydantic import BaseModel
from typing import Literal


class BucketCreate(BaseModel):
    bucket_name: str
    password: str
    visibility: Literal["public", "private"] = "private"

class BucketOpen(BaseModel):
    password: str

class FileRename(BaseModel):
    file_name: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class BucketVisibilityUpdate(BaseModel):
    visibility: Literal["public", "private"]
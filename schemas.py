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
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import os
import secrets
from dotenv import load_dotenv

from database import get_db
from models import Bucket, File, User, ShareLink
from schemas import BucketCreate, BucketOpen, FileRename, UserCreate, UserLogin, BucketVisibilityUpdate
from fastapi import UploadFile, File as FastAPIFile
from pathlib import Path
from fastapi.responses import FileResponse
from encryption import encrypt_data, decrypt_data
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from datetime import datetime, timedelta, timezone
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials



# PASSWORD HASHING SETUP


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# JWT SETUP
load_dotenv()
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(
        User.user_id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user

# APP SETUP

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CREATE BUCKET


@app.post("/buckets")
def create_bucket(
    bucket: BucketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_bucket = Bucket(
        owner_id=current_user.user_id,
        bucket_name=bucket.bucket_name,
        password_hash=pwd_context.hash(bucket.password),
        visibility=bucket.visibility
    )

    db.add(new_bucket)
    db.commit()
    db.refresh(new_bucket)

    return {
        "message": "Bucket created",
        "bucket_id": new_bucket.bucket_id,
        "bucket_name": new_bucket.bucket_name,
        "visibility": new_bucket.visibility
    }

# LIST BUCKETS

@app.get("/buckets")
def list_buckets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    buckets = db.query(Bucket).filter(
        Bucket.owner_id == current_user.user_id
    ).all()

    return [
    {
        "bucket_id": bucket.bucket_id,
        "bucket_name": bucket.bucket_name,
        "visibility": bucket.visibility,
        "created_at": bucket.created_at,
        "updated_at": bucket.updated_at
    }
    for bucket in buckets
]

# OPEN BUCKET

@app.post("/buckets/{bucket_id}/open")
def open_bucket(
    bucket_id: str,
    data: BucketOpen,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == current_user.user_id
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    if not pwd_context.verify(data.password, bucket.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Wrong password"
        )

    return {
        "message": "Bucket opened",
        "bucket_id": bucket.bucket_id,
        "bucket_name": bucket.bucket_name
    }

# DELETE BUCKET

@app.delete("/buckets/{bucket_id}")
def delete_bucket(
    bucket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == current_user.user_id
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    bucket_folder = Path("storage") / str(bucket_id)

    if bucket_folder.exists():
        import shutil
        shutil.rmtree(bucket_folder)

    db.delete(bucket)
    db.commit()

    return {
        "message": "Bucket deleted"
    }

# UPLOAD FILE

@app.post("/buckets/{bucket_id}/files")
def upload_file(
    bucket_id: str,
    file: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find the bucket belonging to the logged-in user
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == current_user.user_id
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    # Create bucket's storage folder
    bucket_folder = Path("storage") / str(bucket_id)
    bucket_folder.mkdir(parents=True, exist_ok=True)

    # Location of the encrypted file
    safe_filename = Path(file.filename or "uploaded_file").name
    file_path = bucket_folder / safe_filename

    # Read original file as bytes
    original_data = file.file.read()

    # Encrypt the bytes
    encrypted_data = encrypt_data(original_data)

    # Store encrypted data on disk
    with open(file_path, "wb") as f:
        f.write(encrypted_data)

    # Size of the ORIGINAL file
    file_size = len(original_data)

    # Save metadata in PostgreSQL
    new_file = File(
        bucket_id=bucket_id,
        file_name=file.filename,
        file_size=file_size,
        content_type=file.content_type or "application/octet-stream",
        storage_path=str(file_path)
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return {
        "message": "File uploaded and encrypted",
        "file_id": new_file.file_id,
        "file_name": new_file.file_name
    }

# LIST FILES

@app.get("/buckets/{bucket_id}/files")
def list_files(
    bucket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Make sure the bucket belongs to the logged-in user
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == current_user.user_id
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    # Find all files belonging to this bucket
    files = db.query(File).filter(
        File.bucket_id == bucket_id
    ).all()

    return files

# DOWNLOAD FILE

@app.get("/buckets/{bucket_id}/files/{file_id}")
def download_file(
    bucket_id: str,
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # First verify that the bucket belongs to the logged-in user
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == current_user.user_id
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    # Find file metadata
    file = db.query(File).filter(
        File.file_id == file_id,
        File.bucket_id == bucket_id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    # Get the encrypted file from disk
    file_path = Path(file.storage_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="File does not exist on disk"
        )

    # Read encrypted bytes
    with open(file_path, "rb") as f:
        encrypted_data = f.read()

    # Decrypt them
    original_data = decrypt_data(encrypted_data)

    # Send the original file back to the user
    return Response(
        content=original_data,
        media_type=file.content_type,
        headers={
            "Content-Disposition": f'attachment; filename="{file.file_name}"'
        }
    )

# DELETE FILE

@app.delete("/buckets/{bucket_id}/files/{file_id}")
def delete_file(
    bucket_id: str,
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # First verify that the bucket belongs to the logged-in user
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == current_user.user_id
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    # Find the file in PostgreSQL
    file = db.query(File).filter(
        File.file_id == file_id,
        File.bucket_id == bucket_id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    # Delete the actual file from disk
    file_path = Path(file.storage_path)

    if file_path.exists():
        file_path.unlink()

    # Delete its metadata from PostgreSQL
    db.delete(file)
    db.commit()

    return {
        "message": "File deleted"
    }

# RENAME FILE

@app.patch("/buckets/{bucket_id}/files/{file_id}")
def rename_file(
    bucket_id: str,
    file_id: str,
    data: FileRename,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # First verify that the bucket belongs to the logged-in user
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == current_user.user_id
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    # Find the file in PostgreSQL
    file = db.query(File).filter(
        File.file_id == file_id,
        File.bucket_id == bucket_id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    # Old location on disk
    old_path = Path(file.storage_path)

    # New location using the new filename
    new_path = old_path.parent / data.file_name

    # Rename the actual file on disk
    old_path.rename(new_path)

    # Update metadata in PostgreSQL
    file.file_name = data.file_name
    file.storage_path = str(new_path)

    db.commit()
    db.refresh(file)

    return {
        "message": "File renamed",
        "file_id": file.file_id,
        "file_name": file.file_name
    }

# AUTH - REGISTER

@app.post("/users/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    # Check whether username already exists
    existing_username = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Check whether email already exists
    existing_email = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Create the user
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )

    # Save user to PostgreSQL
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user_id": new_user.user_id,
        "username": new_user.username
    }

# AUTH - LOGIN

@app.post("/users/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    # Find user by email
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Check password
    if not pwd_context.verify(
        user.password,
        existing_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Create JWT
    payload = {
        "user_id": str(existing_user.user_id),
        "username": existing_user.username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }

    token = jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

# AUTH - CURRENT USER

@app.get("/users/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email
    }

#SHARING THE LINK

@app.post("/buckets/{bucket_id}/share")
def create_share_link(
    bucket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Make sure the logged-in user owns this bucket
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == current_user.user_id
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    # Generate a random secret token
    token = secrets.token_urlsafe(32)

    # Save it in the database
    share = ShareLink(
        bucket_id=bucket_id,
        token=token
    )

    db.add(share)
    db.commit()
    db.refresh(share)

    return {
        "share_token": token,
        "share_url": f"{FRONTEND_URL}/share/{token}"
    }

#USING THE SHARED LINK

@app.get("/share/{token}")
def access_shared_bucket(
    token: str,
    db: Session = Depends(get_db)
):
    share = db.query(ShareLink).filter(
        ShareLink.token == token
    ).first()

    if not share:
        raise HTTPException(
            status_code=404,
            detail="Invalid share link"
        )

    # Check expiration if one exists
    if share.expires_at:
        if datetime.now(timezone.utc) > share.expires_at:
            raise HTTPException(
                status_code=410,
                detail="Share link has expired"
            )

    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == share.bucket_id
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    files = db.query(File).filter(
        File.bucket_id == bucket.bucket_id
    ).all()

    return {
        "bucket_name": bucket.bucket_name,
        "files": [
            {
                "file_id": file.file_id,
                "file_name": file.file_name,
                "file_size": file.file_size,
                "content_type": file.content_type
            }
            for file in files
        ]
    }

#DOWNLOADING SHARED FILES

@app.get("/share/{token}/files/{file_id}")
def download_shared_file(
    token: str,
    file_id: str,
    db: Session = Depends(get_db)
):
    share = db.query(ShareLink).filter(
        ShareLink.token == token
    ).first()

    if not share:
        raise HTTPException(
            status_code=404,
            detail="Invalid share link"
        )

    if share.expires_at:
        if datetime.now(timezone.utc) > share.expires_at:
            raise HTTPException(
                status_code=410,
                detail="Share link has expired"
            )

    file = db.query(File).filter(
        File.file_id == file_id,
        File.bucket_id == share.bucket_id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    file_path = Path(file.storage_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="File does not exist"
        )

    with open(file_path, "rb") as f:
        encrypted_data = f.read()

    original_data = decrypt_data(encrypted_data)

    return Response(
        content=original_data,
        media_type=file.content_type,
        headers={
            "Content-Disposition":
                f'attachment; filename="{file.file_name}"'
        }
    )

@app.patch("/buckets/{bucket_id}/visibility")
def update_bucket_visibility(
    bucket_id: str,
    data: BucketVisibilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == current_user.user_id
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    bucket.visibility = data.visibility
    db.commit()
    db.refresh(bucket)

    return {
        "message": "Bucket visibility updated",
        "bucket_id": bucket.bucket_id,
        "visibility": bucket.visibility
    }
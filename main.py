from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Bucket, File
from schemas import BucketCreate, BucketOpen, FileRename
from fastapi import UploadFile, File as FastAPIFile
from pathlib import Path
from fastapi.responses import FileResponse
from encryption import encrypt_data, decrypt_data
from fastapi.responses import Response


app = FastAPI()


# Temporary test user.
# Replace this with the UUID of your testuser from PostgreSQL.
TEST_USER_ID = "05db2df7-51ec-4e30-ba6b-b84897a59417"

# CREATE BUCKET

@app.post("/buckets")
def create_bucket(
    bucket: BucketCreate,
    db: Session = Depends(get_db)
):
    new_bucket = Bucket(
        owner_id=TEST_USER_ID,
        bucket_name=bucket.bucket_name,
        password_hash=bucket.password,
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
    db: Session = Depends(get_db)
):
    buckets = db.query(Bucket).filter(
        Bucket.owner_id == TEST_USER_ID
    ).all()

    return buckets

# OPEN BUCKET

@app.post("/buckets/{bucket_id}/open")
def open_bucket(
    bucket_id: str,
    data: BucketOpen,
    db: Session = Depends(get_db)
):
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    if bucket.password_hash != data.password:
        raise HTTPException(
            status_code=401,
            detail="Wrong password"
        )

    return {
        "message": "Bucket opened",
        "bucket_id": bucket.bucket_id,
        "bucket_name": bucket.bucket_name
    }

#delete buckets

@app.delete("/buckets/{bucket_id}")
def delete_bucket(
    bucket_id: str,
    db: Session = Depends(get_db)
):
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == TEST_USER_ID
    ).first()

    if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found"
        )

    db.delete(bucket)
    db.commit()

    return {
        "message": "Bucket deleted"
    }

#upload files

@app.post("/buckets/{bucket_id}/files")
def upload_file(
    bucket_id: str,
    file: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db)
):
    # Find the bucket
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == TEST_USER_ID
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
    file_path = bucket_folder / file.filename

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
#list files

@app.get("/buckets/{bucket_id}/files")
def list_files(
    bucket_id: str,
    db: Session = Depends(get_db)
):
    # Make sure the bucket belongs to our test user
    bucket = db.query(Bucket).filter(
        Bucket.bucket_id == bucket_id,
        Bucket.owner_id == TEST_USER_ID
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

#download files

@app.get("/buckets/{bucket_id}/files/{file_id}")
def download_file(
    bucket_id: str,
    file_id: str,
    db: Session = Depends(get_db)
):
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

#delete files

@app.delete("/buckets/{bucket_id}/files/{file_id}")
def delete_file(
    bucket_id: str,
    file_id: str,
    db: Session = Depends(get_db)
):
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

    return {"message": "File deleted"}

#rename files

@app.patch("/buckets/{bucket_id}/files/{file_id}")
def rename_file(
    bucket_id: str,
    file_id: str,
    data: FileRename,
    db: Session = Depends(get_db)
):
    # Find the file
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
# CloudX

CloudX is a lightweight cloud storage application built with FastAPI, PostgreSQL, and React.

It allows users to create password-protected storage buckets, upload and manage files, encrypt files at rest, and share buckets through shareable links.

## Features

- User registration and login
- JWT-based authentication
- Password-protected buckets
- Public/private bucket visibility
- Upload files
- Download files
- Rename files
- Delete files
- Encrypted file storage
- Shareable bucket links
- Responsive React frontend
- PostgreSQL metadata storage

## Tech Stack

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT
- bcrypt
- Cryptography

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Lucide React

## Project Structure

```text
CloudX/
├── main.py
├── models.py
├── schemas.py
├── database.py
├── encryption.py
├── requirements.txt
├── .env
├── storage/
│
└── Frontend/
    ├── package.json
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   └── pages/
    └── ...
    Requirements

Install:

Python 3.10+
Node.js
PostgreSQL
Backend Setup

Create and activate a virtual environment:

python -m venv .venv

Windows:

.venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create a .env file in the CloudX root:

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_random_secret
JWT_ALGORITHM=HS256

FRONTEND_URL=http://localhost:5173

ENCRYPTION_KEY=your_encryption_key

Start the backend:

uvicorn main:app --reload

Backend:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs
Frontend Setup

Open a second terminal:

cd Frontend
npm install
npm run dev

Frontend:

http://localhost:5173

The frontend API URL can be configured in:

Frontend/.env

Example:

VITE_API_URL=http://127.0.0.1:8000
Running CloudX

Start the backend:

uvicorn main:app --reload

Then start the frontend in another terminal:

cd Frontend
npm run dev

Open:

http://localhost:5173
Security

CloudX uses:

bcrypt password hashing
JWT authentication
authenticated bucket ownership checks
encrypted file storage
sanitized file names
randomly generated storage file names
share tokens generated using secure random values

Environment variables containing secrets should never be committed to Git.

Development Notes

The storage/ directory contains encrypted file data and should not be committed to Git.

The PostgreSQL database stores file metadata while the actual encrypted file contents are stored on disk.


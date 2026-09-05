import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

# Get our secret key from .env
key = os.getenv("FERNET_KEY")

# Create the Fernet encryption object
fernet = Fernet(key)


def encrypt_data(data: bytes) -> bytes:
    # Encrypt the file's bytes
    return fernet.encrypt(data)


def decrypt_data(data: bytes) -> bytes:
    # Decrypt the encrypted bytes
    return fernet.decrypt(data)


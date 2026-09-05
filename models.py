from sqlalchemy import Column , String , DateTime
from sqlalchemy import BigInteger, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
import uuid
from sqlalchemy import ForeignKey

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    user_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )
    username = Column(
        String(50),
        nullable=False,
        unique=True
    )
    email = Column(
        String(255),
        nullable=False,
        unique=True
    )
    password_hash = Column(
        String(255),
        nullable=False
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

class Bucket(Base):
    __tablename__ = "buckets"

    bucket_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    # Connects this bucket to its owner
    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False
    )

    bucket_name = Column(
        String(63),
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    visibility = Column(
        String(10),
        nullable=False,
        default="private"
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

class File(Base):
    __tablename__ = "files"

    file_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    # Which bucket does this file belong to?
    bucket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("buckets.bucket_id", ondelete="CASCADE"),
        nullable=False
    )

    file_name = Column(
        String(255),
        nullable=False
    )

    file_size = Column(
        # BIGINT in PostgreSQL
        BigInteger,
        nullable=False
    )

    content_type = Column(
        String(127),
        nullable=False
    )

    # Location of the encrypted file on disk
    storage_path = Column(
        Text,
        nullable=False,
        unique=True
    )

    # Used later to verify file integrity
    checksum = Column(
        String(64),
        nullable=True
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

class ShareLink(Base):
    __tablename__ = "share_links"

    share_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid()
    )

    bucket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("buckets.bucket_id", ondelete="CASCADE"),
        nullable=False
    )

    token = Column(
        String(255),
        nullable=False,
        unique=True
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )
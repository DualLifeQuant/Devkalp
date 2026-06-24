import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
import logging
import uuid

from app.config import settings

logger = logging.getLogger(__name__)

# Configure Cloudinary
if settings.CLOUDINARY_CLOUD_NAME:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/mpeg", "video/quicktime", "video/webm"}
ALLOWED_DOC_TYPES = {"application/pdf", "image/jpeg", "image/png"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024   # 5MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50MB
MAX_DOC_SIZE = 10 * 1024 * 1024    # 10MB


async def upload_image(file: UploadFile, folder: str = "general", 
                        public_id: str = None) -> str:
    """Upload image to Cloudinary, return secure URL"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, f"Invalid file type. Allowed: {ALLOWED_IMAGE_TYPES}")

    content = await file.read()
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(400, "Image too large. Max 5MB.")

    if not settings.CLOUDINARY_CLOUD_NAME:
        # Dev mode: Save locally to static directory
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.join(current_dir, "..", "static", "uploads")
        os.makedirs(static_dir, exist_ok=True)
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        filename = f"{public_id or uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(static_dir, filename)
        with open(filepath, "wb") as f:
            f.write(content)
        return f"{settings.BACKEND_URL}/static/uploads/{filename}"

    try:
        result = cloudinary.uploader.upload(
            content,
            folder=f"devkalp/{folder}",
            public_id=public_id or str(uuid.uuid4()),
            overwrite=True,
            resource_type="image",
            transformation=[{"quality": "auto", "fetch_format": "auto"}]
        )
        return result["secure_url"]
    except Exception as e:
        logger.error(f"Cloudinary upload error: {e}")
        raise HTTPException(500, "Failed to upload image")


async def upload_document(file: UploadFile, folder: str = "documents",
                           public_id: str = None) -> str:
    """Upload document to Cloudinary, return secure URL"""
    if file.content_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(400, "Invalid document type. Allowed: PDF, JPEG, PNG")

    content = await file.read()
    if len(content) > MAX_DOC_SIZE:
        raise HTTPException(400, "Document too large. Max 10MB.")

    if not settings.CLOUDINARY_CLOUD_NAME:
        # Dev mode: Save locally to static directory
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.join(current_dir, "..", "static", "uploads")
        os.makedirs(static_dir, exist_ok=True)
        ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
        filename = f"{public_id or uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(static_dir, filename)
        with open(filepath, "wb") as f:
            f.write(content)
        return f"{settings.BACKEND_URL}/static/uploads/{filename}"

    try:
        resource_type = "raw" if file.content_type == "application/pdf" else "image"
        result = cloudinary.uploader.upload(
            content,
            folder=f"devkalp/{folder}",
            public_id=public_id or str(uuid.uuid4()),
            overwrite=True,
            resource_type=resource_type,
        )
        return result["secure_url"]
    except Exception as e:
        logger.error(f"Document upload error: {e}")
        raise HTTPException(500, "Failed to upload document")


async def upload_resume(file: UploadFile, candidate_id: str) -> str:
    return await upload_document(file, "resumes", f"resume_{candidate_id}")


async def delete_asset(public_id: str):
    if not settings.CLOUDINARY_CLOUD_NAME:
        return
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception as e:
        logger.error(f"Cloudinary delete error: {e}")


async def upload_video(file: UploadFile, folder: str = "general", 
                        public_id: str = None) -> str:
    """Upload video to Cloudinary, return secure URL"""
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(400, f"Invalid file type. Allowed: {ALLOWED_VIDEO_TYPES}")

    content = await file.read()
    if len(content) > MAX_VIDEO_SIZE:
        raise HTTPException(400, f"Video too large. Max {MAX_VIDEO_SIZE / (1024 * 1024)}MB.")

    if not settings.CLOUDINARY_CLOUD_NAME:
        # Dev mode: Save locally to static directory
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.join(current_dir, "..", "static", "uploads")
        os.makedirs(static_dir, exist_ok=True)
        ext = file.filename.split(".")[-1] if "." in file.filename else "mp4"
        filename = f"{public_id or uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(static_dir, filename)
        with open(filepath, "wb") as f:
            f.write(content)
        return f"{settings.BACKEND_URL}/static/uploads/{filename}"

    try:
        result = cloudinary.uploader.upload(
            content,
            folder=f"devkalp/{folder}",
            public_id=public_id or str(uuid.uuid4()),
            overwrite=True,
            resource_type="video",
        )
        return result["secure_url"]
    except Exception as e:
        logger.error(f"Cloudinary video upload error: {e}")
        raise HTTPException(500, "Failed to upload video")

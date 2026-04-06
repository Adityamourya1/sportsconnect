from fastapi import APIRouter, HTTPException, UploadFile, File, status
import logging
from app.services.file_upload import FileUploadService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["upload"])

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image to Cloudinary"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed"
            )
        
        # Validate file size (max 5MB)
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 5MB"
            )
        
        # Upload to Cloudinary
        file_url = await FileUploadService.upload_image(
            contents,
            file.filename
        )
        
        return {
            "url": file_url,
            "message": "Image uploaded successfully"
        }
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/profile-picture")
async def upload_profile_picture(user_id: str, file: UploadFile = File(...)):
    """Upload a profile picture to Cloudinary"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed"
            )
        
        # Validate file size (max 2MB)
        contents = await file.read()
        if len(contents) > 2 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 2MB"
            )
        
        # Upload to Cloudinary
        file_url = await FileUploadService.upload_profile_picture(
            contents,
            user_id
        )
        
        return {
            "url": file_url,
            "message": "Profile picture uploaded successfully"
        }
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

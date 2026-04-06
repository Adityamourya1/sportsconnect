import cloudinary
import cloudinary.uploader
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

class FileUploadService:
    @staticmethod
    async def upload_image(file_stream, filename: str, folder: str = "mysports/posts"):
        """Upload image to Cloudinary"""
        try:
            if not settings.CLOUDINARY_CLOUD_NAME:
                logger.warning("Cloudinary not configured, returning placeholder URL")
                return "https://via.placeholder.com/400x300?text=No+Image"
            
            result = cloudinary.uploader.upload(
                file_stream,
                folder=folder,
                resource_type="auto",
                public_id=filename.split('.')[0]
            )
            
            logger.info(f"✓ Image uploaded: {result['public_id']}")
            return result['secure_url']
        except Exception as e:
            logger.error(f"Image upload failed: {str(e)}")
            raise Exception(f"Failed to upload image: {str(e)}")

    @staticmethod
    async def upload_profile_picture(file_stream, user_id: str):
        """Upload profile picture to Cloudinary"""
        try:
            if not settings.CLOUDINARY_CLOUD_NAME:
                logger.warning("Cloudinary not configured, returning placeholder URL")
                return "https://via.placeholder.com/200x200?text=Profile"
            
            result = cloudinary.uploader.upload(
                file_stream,
                folder="mysports/profiles",
                resource_type="auto",
                public_id=f"profile_{user_id}",
                overwrite=True
            )
            
            logger.info(f"✓ Profile picture uploaded: {result['public_id']}")
            return result['secure_url']
        except Exception as e:
            logger.error(f"Profile picture upload failed: {str(e)}")
            raise Exception(f"Failed to upload profile picture: {str(e)}")

    @staticmethod
    async def delete_file(public_id: str):
        """Delete file from Cloudinary"""
        try:
            if not settings.CLOUDINARY_CLOUD_NAME:
                return True
            
            cloudinary.uploader.destroy(public_id)
            logger.info(f"✓ File deleted: {public_id}")
            return True
        except Exception as e:
            logger.error(f"File deletion failed: {str(e)}")
            return False

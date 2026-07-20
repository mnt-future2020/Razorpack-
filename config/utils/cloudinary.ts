import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PROJECT_FOLDER = "rayzorpack";

export const uploadToCloudinary = async (buffer: Buffer, folder: string) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `${PROJECT_FOLDER}/${folder}`,
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
            transformation: [
              { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    return result as any;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Extract public_id from a Cloudinary URL for deletion
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/folder/subfolder/filename.ext
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

// Delete a Cloudinary image by its URL. Returns true if the asset was deleted,
// false if the URL could not be parsed or the delete failed — callers can log
// the orphan instead of assuming success.
export const deleteByUrl = async (url: string): Promise<boolean> => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) {
    console.warn(`⚠️ Could not parse Cloudinary public_id from URL, skipping delete: ${url}`);
    return false;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete from Cloudinary: ${publicId}`, error);
    return false;
  }
};

export default cloudinary;

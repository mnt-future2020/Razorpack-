import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PROJECT_FOLDER = "rayzorpack";

export type CloudinaryResourceType = 'image' | 'raw';

/**
 * Uploads a buffer to Cloudinary.
 *
 * Defaults to `image` with a 1200x800 limit transformation — correct for
 * photos, and wrong for anything else. Non-image files (PDFs in particular)
 * must pass `resourceType: 'raw'`: under `image` Cloudinary treats a PDF as a
 * rasterisable asset, and delivery of PDFs from /image/upload/ is blocked by
 * default on most accounts.
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string,
  options: { resourceType?: CloudinaryResourceType; publicId?: string } = {}
) => {
  const resourceType = options.resourceType ?? 'image';

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `${PROJECT_FOLDER}/${folder}`,
            resource_type: resourceType,
            // Raw uploads from a Buffer carry no original filename, so without
            // an explicit public_id Cloudinary stores them as "file_ab12cd"
            // with no extension — and the browser then saves an unopenable
            // file. Callers handling documents pass an explicit name.
            ...(options.publicId
              ? { public_id: options.publicId, overwrite: true }
              : { use_filename: true, unique_filename: true }),
            // Image transformations are meaningless for raw assets and cause
            // Cloudinary to reject the upload.
            ...(resourceType === 'image'
              ? {
                  transformation: [
                    { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
                  ]
                }
              : {})
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

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: CloudinaryResourceType = 'image'
) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Which delivery type a stored URL refers to, e.g. /image/upload/ vs /raw/upload/.
export const getResourceTypeFromUrl = (url: string): CloudinaryResourceType =>
  /\/raw\/upload\//.test(url) ? 'raw' : 'image';

// Extract public_id from a Cloudinary URL for deletion.
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/folder/subfolder/filename.ext
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return null;

    // Raw public_ids include the file extension; image/video public_ids do not.
    return getResourceTypeFromUrl(url) === 'raw'
      ? match[1]
      : match[1].replace(/\.\w+$/, '');
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
    await cloudinary.uploader.destroy(publicId, {
      resource_type: getResourceTypeFromUrl(url),
    });
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete from Cloudinary: ${publicId}`, error);
    return false;
  }
};

export default cloudinary;

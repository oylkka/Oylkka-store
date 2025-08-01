import { v2 as cloudinary } from 'cloudinary';

export const DeleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // biome-ignore lint: error
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

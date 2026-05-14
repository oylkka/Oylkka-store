import cloudinary from './cloudinary';

export const DeleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: this is fine
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

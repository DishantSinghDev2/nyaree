// lib/storage/cloudinary.ts
// SHIM — re-exports DishIs image hosting so all existing imports still work
// without any code changes elsewhere in the project.
export {
  uploadImage,
  uploadImageFile,
  uploadImageBase64,
  uploadImageUrl,
  deleteImage,
  getImageUrl,
  optimizeImageUrl,
  getUploadSignature,
} from "./dishis-image";

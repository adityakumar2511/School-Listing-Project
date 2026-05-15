import { cloudinaryService } from "../services/cloudinary.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const uploadImage = asyncHandler(async (request, response) => {
  const result = await cloudinaryService.uploadImage(request.body.filePath);
  response.status(201).json({ data: result });
});

export const deleteImage = asyncHandler(async (request, response) => {
  const result = await cloudinaryService.deleteAsset(String(request.params.id));
  response.json({ data: result });
});

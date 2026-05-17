import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { assertSchoolAccess } from "./schools.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { z } from "zod";

export function cloudinaryPublicIdFromSecureUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let rest = u.pathname;
    const marker = "/upload/";
    const idx = rest.indexOf(marker);
    if (idx === -1) return null;
    rest = rest.slice(idx + marker.length);
    if (/^v\d+\//.test(rest)) {
      rest = rest.replace(/^v\d+\//, "");
    }
    const withoutExt = rest.replace(/\.[^./]+$/, "");
    const decoded = decodeURIComponent(withoutExt);
    return decoded || null;
  } catch {
    return null;
  }
}

const uploadBodySchema = z.object({
  imageBase64: z.string().trim().min(1, "Image data is required")
});

/** POST /api/upload/image — JSON `{ imageBase64 }` data URI or raw base64. */
export const uploadImage = asyncHandler(async (request, response) => {
  if (!request.user) throw new HttpError(401, "Authentication required");

  const { imageBase64 } = uploadBodySchema.parse(request.body ?? {});

  if (!env.CLOUDINARY_CLOUD_NAME) {
    response.status(503).json({ error: "Image upload not configured", data: null });
    return;
  }

  const dataUri = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "schoolsetu",
      resource_type: "auto"
    });
    response.status(201).json({
      data: {
        secure_url: result.secure_url,
        url: result.secure_url ?? result.url,
        public_id: result.public_id
      }
    });
  } catch (err) {
    throw new HttpError(400, err instanceof Error ? err.message : "Upload failed");
  }
});

/** DELETE /api/upload/image/:id — `id` is a school_gallery row id; removes Cloudinary asset and DB row. */
export const deleteImage = asyncHandler(async (request, response) => {
  if (!request.user) throw new HttpError(401, "Authentication required");

  const id = String(request.params.id);

  const row = await prisma.schoolGallery.findUnique({
    where: { id },
    select: { id: true, schoolId: true, cloudinaryUrl: true }
  });

  if (!row) {
    throw new HttpError(404, "Gallery item not found");
  }

  await assertSchoolAccess(request.user, row.schoolId);

  const pid = cloudinaryPublicIdFromSecureUrl(row.cloudinaryUrl);
  if (env.CLOUDINARY_CLOUD_NAME && pid) {
    try {
      await cloudinary.uploader.destroy(pid);
    } catch {
      // Proceed with DB delete even if CDN cleanup fails
    }
  }

  await prisma.schoolGallery.delete({ where: { id: row.id } });

  response.json({ data: { deleted: row.id } });
});

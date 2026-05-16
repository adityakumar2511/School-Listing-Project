import { z } from "zod";
import { aiService } from "../services/ai.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";

const recommendSchema = z.object({
  preferences: z.string().min(10)
});

export const recommendSchools = asyncHandler(async (request, response) => {
  const parsed = recommendSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new HttpError(400, "Please enter at least 10 characters describing what you're looking for.");
  }
  const result = await aiService.recommendSchools(parsed.data.preferences);
  response.json({ data: result });
});

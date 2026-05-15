import { z } from "zod";
import { aiService } from "../services/ai.service.js";
import { asyncHandler } from "../utils/async-handler.js";

const recommendSchema = z.object({
  preferences: z.string().min(10)
});

export const recommendSchools = asyncHandler(async (request, response) => {
  const body = recommendSchema.parse(request.body);
  const result = await aiService.recommendSchools(body.preferences);
  response.json({ data: result });
});

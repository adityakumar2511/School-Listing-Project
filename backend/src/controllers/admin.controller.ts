import { asyncHandler } from "../utils/async-handler.js";
import { mockSchools } from "../data/mock-schools.js";

export const listAdminSchools = asyncHandler(async (_request, response) => {
  response.json({ data: mockSchools });
});

export const approveSchool = asyncHandler(async (request, response) => {
  response.json({ message: "School approved", schoolId: request.params.id });
});

export const rejectSchool = asyncHandler(async (request, response) => {
  response.json({ message: "School rejected", schoolId: request.params.id, reason: request.body.reason });
});

export const listModerationQueue = asyncHandler(async (_request, response) => {
  response.json({ data: [] });
});

export const approveModerationItem = asyncHandler(async (request, response) => {
  response.json({ message: "Pending update approved", id: request.params.id });
});

export const rejectModerationItem = asyncHandler(async (request, response) => {
  response.json({ message: "Pending update rejected", id: request.params.id, reason: request.body.reason });
});

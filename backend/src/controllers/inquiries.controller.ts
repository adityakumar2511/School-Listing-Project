import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { resendService } from "../services/resend.service.js";
import { twilioService } from "../services/twilio.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";

const createInquirySchema = z.object({
  schoolId: z.string(),
  parentName: z.string().trim().min(2),
  phone: z.string().trim().min(10),
  email: z.string().trim().email().optional(),
  message: z.string().trim().optional(),
  childName: z.string().trim().min(2).optional(),
  grade: z.string().trim().min(1).optional()
});

const statusSchema = z.object({
  status: z.enum(["new", "contacted", "interested", "converted", "closed"])
});

const noteSchema = z.object({
  note: z.string().trim().min(1)
});

function last10Digits(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

async function assertCanManageInquiry(user: Express.Request["user"], inquiryId: string) {
  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: {
      id: inquiryId
    },
    include: {
      school: {
        include: {
          details: true
        }
      }
    }
  });

  if (!inquiry) {
    throw new HttpError(404, "Inquiry not found");
  }

  if (user.role === "admin") {
    return inquiry;
  }

  if (user.role === "school") {
    const userRecord = await prisma.user.findUnique({ where: { id: user.id } });
    const userPhone = userRecord?.phone ? last10Digits(userRecord.phone) : "";
    const schoolPhone = inquiry.school.details?.phone
      ? last10Digits(inquiry.school.details.phone)
      : inquiry.school.details?.whatsapp
        ? last10Digits(inquiry.school.details.whatsapp)
        : "";

    if (userPhone && schoolPhone && userPhone === schoolPhone) {
      return inquiry;
    }
  }

  throw new HttpError(403, "You do not have permission to manage this inquiry");
}

export const listInquiries = asyncHandler(async (request, response) => {
  if (!request.user || request.user.role !== "parent") {
    throw new HttpError(403, "Only parents can view their inquiries");
  }

  const inquiries = await prisma.inquiry.findMany({
    where: {
      parentId: request.user.id
    },
    include: {
      school: {
        select: {
          id: true,
          name: true,
          slug: true,
          board: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  response.json({ data: inquiries });
});

export const createInquiry = asyncHandler(async (request, response) => {
  if (!request.user || request.user.role !== "parent") {
    throw new HttpError(403, "Only parents can create inquiries");
  }

  const body = createInquirySchema.parse(request.body);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const school = await prisma.school.findUnique({
    where: {
      id: body.schoolId
    },
    include: {
      details: true
    }
  });

  if (!school) {
    throw new HttpError(404, "School not found");
  }

  const duplicateInquiry = await prisma.inquiry.findFirst({
    where: {
      parentId: request.user.id,
      schoolId: body.schoolId,
      createdAt: {
        gte: sevenDaysAgo
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (duplicateInquiry) {
    throw new HttpError(409, "You have already submitted an inquiry for this school in the last 7 days");
  }

  const inquiry = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: request.user!.id
      },
      data: {
        name: body.parentName,
        phone: body.phone,
        email: body.email
      }
    });

    return tx.inquiry.create({
      data: {
        parentId: request.user!.id,
        schoolId: body.schoolId,
        studentName: body.childName ?? "Not provided",
        classApplying: body.grade ?? "Not provided",
        message: body.message,
        status: "new"
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });
  });

  const whatsappNumber = school.details?.whatsapp ?? school.details?.phone;
  if (whatsappNumber) {
    await twilioService.sendWhatsAppMessage(
      whatsappNumber,
      `New SchoolSetu inquiry for ${school.name}: ${body.parentName}, class ${body.grade ?? "N/A"}, phone ${body.phone}.`
    );
  }

  if (school.details?.email) {
    await resendService.sendMail(
      school.details.email,
      `New admission inquiry — ${school.name}`,
      `<p>You received a new inquiry from <strong>${body.parentName}</strong>.</p>
       <p>Phone: ${body.phone}</p>
       <p>Student: ${body.childName ?? "Not provided"}</p>
       <p>Class: ${body.grade ?? "Not provided"}</p>
       <p>Message: ${body.message ?? "—"}</p>`
    );
  }

  if (body.email) {
    await resendService.sendMail(
      body.email,
      "Your SchoolSetu inquiry has been received",
      `<p>Hi ${body.parentName},</p><p>Your inquiry for ${school.name} has been received. The school team will contact you shortly.</p>`
    );
  }

  response.status(201).json({ data: inquiry });
});

export const updateInquiryStatus = asyncHandler(async (request, response) => {
  await assertCanManageInquiry(request.user, String(request.params.id));
  const body = statusSchema.parse(request.body);

  const inquiry = await prisma.inquiry.update({
    where: {
      id: String(request.params.id)
    },
    data: {
      status: body.status
    },
    include: {
      school: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      parent: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      }
    }
  });

  response.json({ data: inquiry });
});

export const addInquiryNote = asyncHandler(async (request, response) => {
  await assertCanManageInquiry(request.user, String(request.params.id));
  const body = noteSchema.parse(request.body);

  const note = await prisma.inquiryNote.create({
    data: {
      inquiryId: String(request.params.id),
      note: body.note,
      createdBy: request.user!.id
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    }
  });

  response.status(201).json({ data: note });
});

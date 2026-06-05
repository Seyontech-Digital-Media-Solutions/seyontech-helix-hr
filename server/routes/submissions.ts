import { Router } from "express";
import { Prisma, SubmissionStatus, SubmissionType } from "@prisma/client";
import { prisma } from "../db";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { postJoiningSchema, preJoiningSchema, statusSchema } from "../validators";

export const submissionsRouter = Router();

const referencePrefix = {
  [SubmissionType.PRE_JOINING]: "PRE",
  [SubmissionType.POST_JOINING]: "POST",
};

function referenceId(type: SubmissionType) {
  return `${referencePrefix[type]}-${Date.now().toString(36).toUpperCase().slice(-7)}`;
}

function toApiSubmission(
  submission: Awaited<ReturnType<typeof prisma.submission.findMany>>[number],
) {
  return {
    id: submission.id,
    referenceId: submission.referenceId,
    type: submission.type,
    status: submission.status,
    applicantName: submission.applicantName,
    email: submission.email,
    position: submission.position,
    department: submission.department,
    payload: submission.payload,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}

submissionsRouter.use(requireAuth);

submissionsRouter.post("/pre-joining", async (req, res, next) => {
  try {
    const data = preJoiningSchema.parse(req.body);
    const submission = await prisma.submission.create({
      data: {
        referenceId: referenceId(SubmissionType.PRE_JOINING),
        type: SubmissionType.PRE_JOINING,
        status: SubmissionStatus.PENDING,
        applicantName: data.fullName,
        email: data.email,
        position: data.position,
        department: data.department,
        payload: data,
        submittedById: req.auth!.profileId,
      },
    });
    res.status(201).json({ submission: toApiSubmission(submission) });
  } catch (error) {
    next(error);
  }
});

submissionsRouter.post("/post-joining", async (req, res, next) => {
  try {
    const data = postJoiningSchema.parse(req.body);
    const submission = await prisma.submission.create({
      data: {
        referenceId: referenceId(SubmissionType.POST_JOINING),
        type: SubmissionType.POST_JOINING,
        status: SubmissionStatus.JOINED,
        applicantName: data.employeeId,
        email: data.officialEmail,
        position: data.employmentType,
        department: data.workLocation,
        payload: data,
        submittedById: req.auth!.profileId,
      },
    });
    res.status(201).json({ submission: toApiSubmission(submission) });
  } catch (error) {
    next(error);
  }
});

submissionsRouter.get("/", async (req, res, next) => {
  try {
    const { status, type, q } = req.query;
    const where: Prisma.SubmissionWhereInput = {};

    if (req.auth!.role !== "admin") {
      where.submittedById = req.auth!.profileId;
    }
    if (typeof status === "string" && status in SubmissionStatus) {
      where.status = status as SubmissionStatus;
    }
    if (typeof type === "string" && type in SubmissionType) {
      where.type = type as SubmissionType;
    }
    if (typeof q === "string" && q.trim()) {
      where.OR = [
        { referenceId: { contains: q.trim(), mode: "insensitive" } },
        { applicantName: { contains: q.trim(), mode: "insensitive" } },
        { email: { contains: q.trim(), mode: "insensitive" } },
      ];
    }

    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ submissions: submissions.map(toApiSubmission) });
  } catch (error) {
    next(error);
  }
});

submissionsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const submission = await prisma.submission.findUnique({ where: { id } });
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    if (req.auth!.role !== "admin" && submission.submittedById !== req.auth!.profileId) {
      return res.status(403).json({ error: "Access denied" });
    }
    return res.json({ submission: toApiSubmission(submission) });
  } catch (error) {
    next(error);
  }
});

submissionsRouter.patch("/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const { status } = statusSchema.parse(req.body);
    const submission = await prisma.submission.update({
      where: { id },
      data: { status },
    });
    res.json({ submission: toApiSubmission(submission) });
  } catch (error) {
    next(error);
  }
});

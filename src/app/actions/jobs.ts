"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { JobApplicationStatus, JobPayType, JobWorkType } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { isStaff, requireUser } from "@/lib/auth";
import { type ActionState, fieldError, uniqueViolation } from "@/lib/actions";
import { notify } from "@/lib/notifications";
import { sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { sentenceCase } from "@/lib/titlecase";
import {
  JOB_CATEGORIES,
  JOB_PAY_METHODS,
  applicationStatus,
  payHasCommission,
} from "@/lib/jobs";
import { slugify } from "@/lib/slug";

const MAX_OPEN_JOBS = 10;

async function uniqueJobSlug(title: string) {
  const base = slugify(title).slice(0, 70) || "job";
  let candidate = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.job.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

const optionalNumber = (formData: FormData, key: string) => {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? undefined : value;
};

const jobSchema = z
  .object({
    title: z.string().trim().min(6, "Give the job a clear title").max(90),
    description: z
      .string()
      .trim()
      .min(40, "Describe the work in at least a couple of sentences")
      .max(4000),
    requirements: z.string().trim().max(1500).optional(),
    category: z.enum(JOB_CATEGORIES.map((c) => c.value) as [string, ...string[]], {
      message: "Pick what kind of job it is",
    }),
    workType: z.nativeEnum(JobWorkType),
    remote: z.boolean(),
    hybrid: z.boolean(),
    city: z.string().trim().max(80).optional(),
    openings: z.coerce
      .number()
      .int("Whole numbers only")
      .min(1, "Hiring at least 1 person")
      .max(500, "That's a lot — enter a smaller number")
      .default(1),
    hoursPerWeek: z.coerce
      .number()
      .int("Whole hours only")
      .min(1)
      .max(80)
      .optional(),
    payType: z.nativeEnum(JobPayType),
    payUsd: z.coerce.number().min(0, "Pay can't be negative").max(1_000_000).optional(),
    payMaxUsd: z.coerce.number().min(0).max(1_000_000).optional(),
    commissionPct: z.coerce
      .number()
      .int("Whole percent only")
      .min(1, "Commission is at least 1%")
      .max(100, "Commission is at most 100%")
      .optional(),
    payMethods: z.array(z.enum(JOB_PAY_METHODS.map((m) => m.value) as [string, ...string[]])),
  })
  .superRefine((data, ctx) => {
    if (!data.remote && !data.city)
      ctx.addIssue({ code: "custom", message: "Add the city, or tick \"Work from home\"" });
    if (data.remote && data.hybrid)
      ctx.addIssue({ code: "custom", message: "Pick remote OR hybrid, not both" });
    if (data.payUsd && data.payMaxUsd && data.payMaxUsd < data.payUsd)
      ctx.addIssue({ code: "custom", message: "Top of pay range is below the minimum" });
    if (payHasCommission(data.payType) && !data.commissionPct)
      ctx.addIssue({ code: "custom", message: "Enter the commission percent" });
  });

function readJobForm(formData: FormData) {
  return jobSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    requirements: formData.get("requirements") ?? undefined,
    category: formData.get("category"),
    workType: formData.get("workType"),
    remote: formData.get("remote") === "on",
    hybrid: formData.get("hybrid") === "on",
    city: formData.get("city") || undefined,
    openings: formData.get("openings") ?? "1",
    hoursPerWeek: optionalNumber(formData, "hoursPerWeek"),
    payType: formData.get("payType"),
    payUsd: optionalNumber(formData, "payUsd"),
    payMaxUsd: optionalNumber(formData, "payMaxUsd"),
    commissionPct: optionalNumber(formData, "commissionPct"),
    payMethods: formData.getAll("payMethods").map(String),
  });
}

function jobColumns(data: z.infer<typeof jobSchema>) {
  return {
    title: sentenceCase(data.title),
    description: data.description,
    requirements: data.requirements || null,
    category: data.category,
    workType: data.workType,
    remote: data.remote,
    hybrid: data.hybrid,
    city: data.city || null,
    openings: data.openings,
    hoursPerWeek: data.hoursPerWeek ?? null,
    payType: data.payType,
    payMinor:
      data.payType === "COMMISSION" || !data.payUsd ? null : Math.round(data.payUsd * 100),
    payMaxMinor:
      data.payType === "COMMISSION" || !data.payUsd || !data.payMaxUsd
        ? null
        : Math.round(data.payMaxUsd * 100),
    commissionPct: data.commissionPct ?? null,
    payMethods: data.payMethods,
  };
}

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form.";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function ownJob(jobId: string) {
  const user = await requireUser();
  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job || (job.posterId !== user.id && !isStaff(user))) throw new Error("FORBIDDEN");
  return job;
}

function revalidateJob(slug: string) {
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${slug}`);
  revalidatePath("/dashboard/jobs");
}

export async function createJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let slug: string;
  try {
    const user = await requireUser();
    if (!user.emailVerifiedAt) return { error: "Verify your email first, then post the job." };
    const parsed = readJobForm(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const open = await db.job.count({ where: { posterId: user.id, status: "OPEN" } });
    if (open >= MAX_OPEN_JOBS && !isStaff(user))
      return { error: `You can have up to ${MAX_OPEN_JOBS} open jobs. Close one first.` };
    const columns = jobColumns(parsed.data);
    slug = await uniqueJobSlug(columns.title);
    await db.job.create({ data: { ...columns, slug, posterId: user.id } });
    revalidateJob(slug);
  } catch (error) {
    return fieldError(error);
  }
  redirect(`/jobs/${slug}?posted=1`);
}

export async function updateJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let slug: string;
  try {
    const job = await ownJob(String(formData.get("jobId") ?? ""));
    const parsed = readJobForm(formData);
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    await db.job.update({ where: { id: job.id }, data: jobColumns(parsed.data) });
    slug = job.slug;
    revalidateJob(slug);
  } catch (error) {
    return fieldError(error);
  }
  redirect(`/jobs/${slug}`);
}

export async function toggleJobAction(formData: FormData) {
  const job = await ownJob(String(formData.get("jobId") ?? ""));
  await db.job.update({
    where: { id: job.id },
    data: { status: job.status === "OPEN" ? "CLOSED" : "OPEN" },
  });
  revalidateJob(job.slug);
}

const applySchema = z.object({
  jobId: z.string().min(1),
  message: z
    .string()
    .trim()
    .min(20, "Tell the poster in a few lines why you're a good fit")
    .max(1500),
  phone: z.string().trim().max(30).optional(),
});

export async function applyJobAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = applySchema.safeParse({
      jobId: formData.get("jobId"),
      message: formData.get("message"),
      phone: formData.get("phone") || undefined,
    });
    if (!parsed.success) return { error: firstIssue(parsed.error) };
    const job = await db.job.findUnique({
      where: { id: parsed.data.jobId },
      include: { poster: { select: { email: true } } },
    });
    if (!job || job.status !== "OPEN") return { error: "This job is no longer taking applications." };
    if (job.posterId === user.id) return { error: "This is your own job post." };

    try {
      await db.jobApplication.create({
        data: {
          jobId: job.id,
          applicantId: user.id,
          message: parsed.data.message,
          phone: parsed.data.phone || null,
        },
      });
    } catch (error) {
      if (uniqueViolation(error)) return { error: "You've already applied for this job." };
      throw error;
    }

    const href = `/jobs/${job.slug}#applicants`;
    await notify({
      userId: job.posterId,
      title: `New applicant: ${user.name}`,
      body: job.title,
      href,
    });
    await sendEmail({
      to: job.poster.email,
      subject: `New applicant for "${job.title}"`,
      html: shell(
        `${escapeHtml(user.name)} applied for your job`,
        `<p style="margin:0 0 8px"><strong>${escapeHtml(job.title)}</strong></p>
        <p style="margin:0 0 8px;white-space:pre-line">${escapeHtml(parsed.data.message)}</p>
        <p style="margin:0 0 16px">Email: ${escapeHtml(user.email)}${
          parsed.data.phone ? ` · Phone: ${escapeHtml(parsed.data.phone)}` : ""
        }</p>
        <a href="${siteUrl()}${href}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:600">See all applicants</a>`,
      ),
    });
    revalidateJob(job.slug);
    return { success: "Applied! The poster has your message and will contact you." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function setApplicationStatusAction(formData: FormData) {
  const status = z.nativeEnum(JobApplicationStatus).parse(formData.get("status"));
  const application = await db.jobApplication.findUniqueOrThrow({
    where: { id: String(formData.get("applicationId") ?? "") },
  });
  const job = await ownJob(application.jobId);
  await db.jobApplication.update({ where: { id: application.id }, data: { status } });
  if (status !== "NEW")
    await notify({
      userId: application.applicantId,
      title: `Your application: ${applicationStatus(status).label}`,
      body: job.title,
      href: `/jobs/${job.slug}`,
    });
  revalidateJob(job.slug);
}

import crypto from "crypto";
import { db } from "@/lib/db";
import type { JobWorkType } from "@prisma/client";

const ADMIN_ID = "cms22di8e0000yelb71ajutf0";

type FeedJob = {
  title: string;
  company: string;
  url: string;
  description: string;
  location: string;
  remote: boolean;
  workType: JobWorkType;
  category: string;
};

function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;|&apos;/g, "'")
    .replace(/&mdash;|&ndash;/g, "—")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function stripHtml(html: string) {
  // Feeds double-encode: decode first so &lt;p&gt; becomes a real tag, strip it,
  // then repeat for deeper nesting (up to 3 rounds).
  let text = html;
  for (let i = 0; i < 3; i++) {
    const next = decodeEntities(text)
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|ul|ol|tr|td|table|blockquote|section|article)>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, "");
    if (next === text) break;
    text = next;
  }
  return text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function categoryFor(text: string): string {
  const t = text.toLowerCase();
  if (/sales|telemarket|business development|account exec/.test(t)) return "sales";
  if (/tutor|teacher|education|instructor/.test(t)) return "tutoring";
  if (/admin|office|assistant|coordinator|data entry|operations/.test(t))
    return "office";
  if (/nanny|babysit|childcare|au pair/.test(t)) return "nanny";
  if (/elder|senior care|caregiver|home health/.test(t)) return "elder-care";
  if (/clean|housekeep|janitor/.test(t)) return "cleaning";
  if (/cook|chef|kitchen|tiffin|cater/.test(t)) return "cooking";
  if (/driver|delivery|courier|chauffeur/.test(t)) return "driving";
  if (/event|wedding|hospitality/.test(t)) return "events";
  return "other";
}

function workTypeFor(text: string): JobWorkType {
  const t = text.toLowerCase();
  if (/part.?time/.test(t)) return "PART_TIME";
  if (/contract|freelance|temporary/.test(t)) return "CONTRACT";
  if (/intern/.test(t)) return "INTERNSHIP";
  return "FULL_TIME";
}

function slugFor(url: string) {
  return `feed-${crypto.createHash("sha1").update(url).digest("hex").slice(0, 16)}`;
}

async function remotive(): Promise<FeedJob[]> {
  const res = await fetch(
    "https://remotive.com/api/remote-jobs?limit=30",
    { signal: AbortSignal.timeout(15000), cache: "no-store" },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as {
    jobs?: {
      title: string;
      company_name: string;
      url: string;
      description: string;
      candidate_required_location: string;
      category: string;
      job_type: string;
    }[];
  };
  return (data.jobs ?? []).map((j) => ({
    title: j.title,
    company: j.company_name,
    url: j.url,
    description: stripHtml(j.description).slice(0, 3000),
    location: j.candidate_required_location || "Remote",
    remote: true,
    workType: workTypeFor(j.job_type),
    category: categoryFor(`${j.category} ${j.title}`),
  }));
}

async function arbeitnow(): Promise<FeedJob[]> {
  const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    data?: {
      title: string;
      company_name: string;
      url: string;
      description: string;
      location: string;
      remote: boolean;
      job_types: string[];
      tags: string[];
    }[];
  };
  return (data.data ?? [])
    .filter((j) => j.remote)
    .slice(0, 30)
    .map((j) => ({
      title: j.title,
      company: j.company_name,
      url: j.url,
      description: stripHtml(j.description).slice(0, 3000),
      location: j.location,
      remote: true,
      workType: workTypeFor(j.job_types.join(" ")),
      category: categoryFor(`${j.title} ${j.tags.join(" ")}`),
    }));
}

async function weWorkRemotely(): Promise<FeedJob[]> {
  const res = await fetch(
    "https://weworkremotely.com/categories/remote-customer-support-jobs.rss",
    { signal: AbortSignal.timeout(15000), cache: "no-store" },
  );
  if (!res.ok) return [];
  const xml = await res.text();
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, 15);
  return items.map(([, item]) => {
    const pick = (tag: string) =>
      item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1]
        ?.replace(/<!\[CDATA\[|\]\]>/g, "")
        .trim() ?? "";
    const title = pick("title").replace(/\s*:\s*[^:]+$/, "");
    const company = pick("title").split(":")[0]?.trim() || "Company";
    return {
      title: title || pick("title"),
      company,
      url: pick("link"),
      description: stripHtml(pick("description")).slice(0, 3000),
      location: "Remote",
      remote: true,
      workType: workTypeFor(title),
      category: categoryFor(title),
    };
  }).filter((j) => j.url && j.title);
}

/** Pulls the free no-key job feeds and upserts them as external listings. */
export async function syncJobFeeds() {
  const sources = await Promise.allSettled([
    remotive(),
    arbeitnow(),
    weWorkRemotely(),
  ]);
  const jobs = sources.flatMap((s) => (s.status === "fulfilled" ? s.value : []));

  const seen = new Set<string>();
  let created = 0;
  for (const job of jobs) {
    const slug = slugFor(job.url);
    if (seen.has(slug)) continue;
    seen.add(slug);
    const exists = await db.job.findUnique({ where: { slug }, select: { id: true } });
    if (exists) continue;
    await db.job.create({
      data: {
        slug,
        posterId: ADMIN_ID,
        title: `${job.title} — ${job.company}`.slice(0, 200),
        category: job.category,
        workType: job.workType,
        remote: job.remote,
        city: job.location === "Remote" ? null : job.location,
        payType: "FIXED",
        applyUrl: job.url,
        status: "OPEN",
        description: [
          job.description || `${job.title} at ${job.company}.`,
          "",
          `📍 ${job.location}`,
          "",
          "Apply on the employer's site — button below.",
        ]
          .join("\n")
          .slice(0, 4000),
      },
    });
    created += 1;
  }
  return { fetched: jobs.length, created };
}

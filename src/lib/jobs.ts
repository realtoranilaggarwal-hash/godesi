import type { JobApplicationStatus, JobPayType, JobWorkType } from "@prisma/client";

export const JOB_CATEGORIES = [
  { value: "nanny", label: "Nanny", icon: "👶" },
  { value: "babysitting", label: "Babysitting", icon: "🧸" },
  { value: "elder-care", label: "Elder care", icon: "🧓" },
  { value: "spa-at-home", label: "Spa & beauty at home", icon: "💆" },
  { value: "cleaning", label: "House cleaning", icon: "🧹" },
  { value: "cooking", label: "Cooking & tiffin", icon: "🍲" },
  { value: "tutoring", label: "Tutoring", icon: "📚" },
  { value: "driving", label: "Driving & errands", icon: "🚗" },
  { value: "events", label: "Event help", icon: "🎉" },
  { value: "sales", label: "Sales & phone calling", icon: "📞" },
  { value: "office", label: "Office & admin", icon: "💻" },
  { value: "other", label: "Other", icon: "🧰" },
] as const;

export function jobCategory(value: string) {
  return (
    JOB_CATEGORIES.find((category) => category.value === value) ??
    JOB_CATEGORIES[JOB_CATEGORIES.length - 1]
  );
}

export const JOB_WORK_TYPES: { value: JobWorkType; label: string }[] = [
  { value: "PART_TIME", label: "Part-time" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "ONE_OFF", label: "Mini job / one-off" },
  { value: "CONTRACT", label: "Freelance / contractor" },
  { value: "INTERNSHIP", label: "Internship" },
];

/** "🏠 Work from home", "🔀 Hybrid", or "📍 Edison, NJ". */
export function locationLabel(job: { remote: boolean; hybrid?: boolean; city: string | null }) {
  if (job.remote) return "🏠 Work from home";
  if (job.hybrid) return `🔀 Hybrid${job.city ? ` — ${job.city}` : ""}`;
  return `📍 ${job.city ?? "On-site"}`;
}

export const JOB_PAY_TYPES: { value: JobPayType; label: string; unit: string }[] = [
  { value: "HOURLY", label: "Hourly", unit: "an hour" },
  { value: "DAILY", label: "Daily", unit: "a day" },
  { value: "WEEKLY", label: "Weekly", unit: "a week" },
  { value: "MONTHLY", label: "Monthly", unit: "a month" },
  { value: "PER_TASK", label: "Per sale / per task", unit: "per sale or task" },
  { value: "FIXED", label: "Fixed price for the whole job", unit: "for the job" },
  { value: "COMMISSION", label: "Commission only", unit: "" },
  { value: "BASE_PLUS_COMMISSION", label: "Monthly base + commission", unit: "a month" },
];

export const JOB_PAY_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "zelle", label: "Zelle / bank transfer" },
  { value: "check", label: "Check" },
  { value: "paypal", label: "PayPal / Venmo" },
  { value: "payroll", label: "Payroll (W-2)" },
] as const;

export const JOB_APPLICATION_STATUSES: {
  value: JobApplicationStatus;
  label: string;
  tone: "slate" | "green" | "amber" | "indigo" | "red";
}[] = [
  { value: "NEW", label: "New", tone: "indigo" },
  { value: "SHORTLISTED", label: "Shortlisted", tone: "amber" },
  { value: "HIRED", label: "Hired", tone: "green" },
  { value: "DECLINED", label: "Not a fit", tone: "slate" },
];

export function workTypeLabel(value: JobWorkType) {
  return JOB_WORK_TYPES.find((type) => type.value === value)?.label ?? value;
}

export function applicationStatus(value: JobApplicationStatus) {
  return JOB_APPLICATION_STATUSES.find((status) => status.value === value)!;
}

/** Commission is required for these pay types; COMMISSION has no fixed amount. */
export function payHasCommission(payType: JobPayType) {
  return payType === "COMMISSION" || payType === "BASE_PLUS_COMMISSION";
}

function dollars(minor: number) {
  const value = minor / 100;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** e.g. "$200 a month + 10% commission", "$18 an hour", "15% commission". */
export function payLabel(job: {
  payType: JobPayType;
  payMinor: number | null;
  payMaxMinor?: number | null;
  commissionPct: number | null;
}) {
  const type = JOB_PAY_TYPES.find((option) => option.value === job.payType);
  const range =
    job.payMinor && job.payMaxMinor && job.payMaxMinor > job.payMinor
      ? `${dollars(job.payMinor)}–${dollars(job.payMaxMinor)}`
      : job.payMinor
        ? dollars(job.payMinor)
        : "";
  const amount =
    job.payType !== "COMMISSION" && range
      ? `${range}${type?.unit ? ` ${type.unit}` : ""}`
      : "";
  const commission = job.commissionPct ? `${job.commissionPct}% commission` : "";
  const label = [amount, commission].filter(Boolean).join(" + ");
  return label || `${type?.label ?? "Pay"}, agreed on the call`;
}

export function payMethodLabels(methods: string[]) {
  return JOB_PAY_METHODS.filter((method) => methods.includes(method.value)).map(
    (method) => method.label,
  );
}

import Link from "next/link";

export function AmbassadorBadge({
  ambassador,
}: {
  ambassador: { id: string; status: string; city: string } | null;
}) {
  if (ambassador?.status !== "APPROVED") return null;
  return (
    <Link
      href={`/ambassador/certificate/${ambassador.id}`}
      title="Approved GoDesi Local Ambassador — signed the GoDesi ethics pledge"
      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-0.5 text-[10px] font-bold text-white hover:opacity-90"
    >
      <span aria-hidden>🤝</span>
      GoDesi Ambassador · {ambassador.city}
    </Link>
  );
}

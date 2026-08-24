import { AdminNav } from "@/components/AdminNav";
import { getCurrentUser } from "@/lib/auth";
import { sectionsFor } from "@/lib/adminSections";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="space-y-4">
      {user ? <AdminNav sections={sectionsFor(user)} /> : null}
      {children}
    </div>
  );
}

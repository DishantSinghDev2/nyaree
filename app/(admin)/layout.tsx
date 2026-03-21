// app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side session check
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/auth/login?next=/dashboard");
  if ((session.user as any).role !== "admin") redirect("/?error=unauthorized");

  return (
    <div className="admin-layout">
      <AdminSidebar user={session.user} />
      <main className="admin-content">{children}</main>
    </div>
  );
}

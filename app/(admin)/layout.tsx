// app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // NextAuth v5 beta: auth() works as a server-side session getter
  const session = await auth();

  if (!session?.user) redirect("/auth/login?next=/dashboard");
  if ((session.user as any).role !== "admin") redirect("/?error=unauthorized");

  return (
    <div className="admin-layout">
      <AdminSidebar user={session.user} />
      <main className="admin-content">{children}</main>
    </div>
  );
}


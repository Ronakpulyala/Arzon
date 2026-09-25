import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Providers } from "@/components/providers";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const name = session.user.name ?? "Team member";

  return (
    <Providers>
      <div className="min-h-screen bg-surface-page">
        <Sidebar role={role} />
        <div className="md:pl-64">
          <Topbar name={name} role={role} />
          <main className="px-6 py-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}

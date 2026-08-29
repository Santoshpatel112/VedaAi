import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#F6F6F6]">
        <Sidebar session={session} />
        {/* DashboardShell reads sidebar context to set the correct left padding */}
        <DashboardShell session={session}>
          {children}
        </DashboardShell>
      </div>
    </SidebarProvider>
  );
}

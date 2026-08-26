import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

/**
 * Dashboard layout — only rendered for authenticated app routes.
 * Route group (dashboard) means the folder name is NOT in the URL.
 * We verify the session server-side here as a secondary guard (middleware is primary).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#F6F6F6]">
      {/* Sidebar */}
      <Sidebar session={session} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <TopBar session={session} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

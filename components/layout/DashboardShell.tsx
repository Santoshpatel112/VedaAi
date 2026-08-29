"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { useSidebar } from "./SidebarContext";
import type { UserSession } from "@/lib/auth/session";

interface DashboardShellProps {
  session: UserSession | null;
  children: React.ReactNode;
}

// Generate breadcrumb based on current path
function getBreadcrumb(pathname: string): { title: string; breadcrumb?: string } {
  if (pathname.includes("/exams")) {
    if (pathname.includes("/processing")) {
      return { title: "Exams", breadcrumb: "Processing" };
    }
    if (pathname.includes("/results")) {
      return { title: "Exams", breadcrumb: "Results" };
    }
    return { title: "Exams", breadcrumb: "Assessment Extraction" };
  }
  if (pathname.includes("/home")) {
    return { title: "Home" };
  }
  if (pathname.includes("/classroom")) {
    return { title: "My Classroom" };
  }
  if (pathname.includes("/assignments")) {
    return { title: "Assignments" };
  }
  if (pathname.includes("/library")) {
    return { title: "My Library" };
  }
  if (pathname.includes("/settings")) {
    return { title: "Settings" };
  }
  return { title: "Dashboard" };
}

export function DashboardShell({ session, children }: DashboardShellProps) {
  const { expanded } = useSidebar();
  const pathname = usePathname();
  const { title, breadcrumb } = getBreadcrumb(pathname);

  return (
    <div
      className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
        expanded ? "md:pl-[228px]" : "md:pl-[68px]"
      }`}
    >
      <TopBar session={session} title={title} breadcrumb={breadcrumb} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}

"use client";

import React from "react";
import { Bell, ChevronRight } from "lucide-react";
import type { UserSession } from "@/lib/auth/session";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  breadcrumb?: string;
  session: UserSession | null;
}

export function TopBar({
  title = "Exams",
  subtitle,
  breadcrumb = "Assessment Extraction",
  session,
}: TopBarProps) {
  // Derive initials from real session name
  const initials = session?.name
    ? session.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "?";

  const displayName = session?.name ?? "Teacher";
  const displayRole = session?.department ?? session?.role ?? "Teacher";

  return (
    <header className="h-16 bg-white border-b border-[#E2E2E2] px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left: Breadcrumbs and Title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#606266] font-medium">{title}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#8C8C8C]" />
        <span className="text-[#21262C] font-semibold">{breadcrumb}</span>
        {subtitle && (
          <span className="hidden sm:inline text-xs text-[#8C8C8C] ml-2 border-l border-[#E2E2E2] pl-3">
            {subtitle}
          </span>
        )}
      </div>

      {/* Right: Actions and User Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          className="w-9 h-9 rounded-xl bg-[#F6F6F6] hover:bg-[#EAEAEA] flex items-center justify-center text-[#606266] transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF5500] rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile Pill — shows real session data */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#E2E2E2]">
          <div className="w-9 h-9 rounded-xl bg-[#FFF3EE] border border-[#FFCCAA] flex items-center justify-center text-[#FF5500] font-bold text-sm shadow-2xs select-none">
            {initials}
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-[#21262C] leading-none">
              {displayName}
            </span>
            <span className="text-[10px] text-[#8C8C8C] font-medium mt-0.5 capitalize">
              {displayRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

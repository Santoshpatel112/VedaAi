"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Bell, HelpCircle, Sparkles, ChevronLeft, ChevronDown } from "lucide-react";
import type { UserSession } from "@/lib/auth/session";

interface TopBarProps {
  title?: string;
  breadcrumb?: string;
  session: UserSession | null;
}

export function TopBar({
  title = "Exams",
  breadcrumb,
  session,
}: TopBarProps) {
  const initials = session?.name
    ? session.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "?";

  const displayName = session?.name ?? "Teacher";

  return (
    <header className="h-14 bg-white border-b border-[#EEEEEE] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: breadcrumb — Figma style (Exams > Breadcrumb) */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-[#888888] font-normal shrink-0">{title}</span>

        {breadcrumb && (
          <>
            <ChevronLeft className="w-3.5 h-3.5 text-[#DDDDDD] rotate-180 shrink-0" />
            <span className="text-sm text-[#1A1A1A] font-semibold truncate">{breadcrumb}</span>
          </>
        )}
      </div>

      {/* Right: help, bell, sparkle, avatar + name */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Help */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#888888] hover:bg-[#F5F5F5] transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-[17px] h-[17px]" />
        </button>

        {/* Bell with orange dot */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#888888] hover:bg-[#F5F5F5] transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-[17px] h-[17px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5500] rounded-full border-[1.5px] border-white" />
        </button>

        {/* Sparkle / AI */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#888888] hover:bg-[#F5F5F5] transition-colors"
          aria-label="AI Features"
        >
          <Sparkles className="w-[17px] h-[17px]" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[#EEEEEE] mx-1" />

        {/* Avatar + name + chevron */}
        <button className="flex items-center gap-2 rounded-full hover:bg-[#F5F5F5] pr-1 pl-0.5 py-0.5 transition-colors">
          {/* Circular avatar with photo or initials */}
          <div className="w-8 h-8 rounded-full bg-[#E8E8E8] border border-[#DDDDDD] flex items-center justify-center text-[#444444] font-bold text-xs select-none overflow-hidden shrink-0">
            {initials}
          </div>
          <span className="hidden sm:block text-sm font-medium text-[#1A1A1A] max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-[#AAAAAA] shrink-0" />
        </button>
      </div>
    </header>
  );
}

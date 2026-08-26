"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  GraduationCap,
  FileText,
  CheckSquare,
  Library,
  Settings,
  Building2,
  Menu,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";
import type { UserSession } from "@/lib/auth/session";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/home", icon: Home },
  { name: "My Classroom", href: "/classroom", icon: GraduationCap },
  { name: "Assignments", href: "/assignments", icon: FileText },
  { name: "Exams", href: "/exams", icon: CheckSquare },
  { name: "My Library", href: "/library", icon: Library },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  session: UserSession | null;
}

// ─── Extracted as a module-level component to avoid "component created during render" lint error ───
function NavList({
  pathname,
  onNavClick,
}: {
  pathname: string;
  onNavClick?: () => void;
}) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavClick}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              isActive
                ? "bg-[#FFF3EE] text-[#FF5500]"
                : "text-[#606266] hover:bg-[#F6F6F6] hover:text-[#21262C]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`w-4 h-4 ${isActive ? "text-[#FF5500]" : "text-[#8C8C8C]"}`}
              />
              <span>{item.name}</span>
            </div>
            {isActive && (
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const schoolName = session?.school;
  const department = session?.department;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network error
    }
    router.push("/login");
    router.refresh();
  };

  const sidebarFooter = (
    <div className="p-3 border-t border-[#F0F0F0] space-y-2">
      {/* School / institution card — shown only when session has that info */}
      {(schoolName || department) && (
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E2E2E2] shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#FFF3EE] flex items-center justify-center text-[#FF5500] shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            {schoolName && (
              <p className="text-xs font-bold text-[#21262C] truncate">
                {schoolName}
              </p>
            )}
            {department && (
              <p className="text-[11px] text-[#8C8C8C] truncate">{department}</p>
            )}
          </div>
        </div>
      )}

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#606266] hover:bg-[#FFF3EE] hover:text-[#FF5500] transition-all duration-150 disabled:opacity-60"
      >
        <LogOut className="w-4 h-4" />
        <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
      </button>
    </div>
  );

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E2E2E2] min-h-screen fixed left-0 top-0 bottom-0 z-30 select-none">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#F0F0F0] shrink-0">
          <Link href="/exams" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500] flex items-center justify-center text-white font-black text-lg shadow-xs group-hover:scale-105 transition-transform duration-150">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-[#21262C] leading-none tracking-tight">
                Veda<span className="text-[#FF5500]">AI</span>
              </span>
              <span className="text-[10px] text-[#606266] font-medium tracking-wide flex items-center gap-1 mt-0.5">
                <Sparkles className="w-2.5 h-2.5 text-[#FF5500]" />
                Teacher Toolkit
              </span>
            </div>
          </Link>
        </div>

        <NavList pathname={pathname} />
        {sidebarFooter}
      </aside>

      {/* ─── Mobile Header Bar ─── */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-[#E2E2E2] fixed top-0 left-0 right-0 z-40">
        <Link href="/exams" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#FF5500] flex items-center justify-center text-white font-black text-base">
            V
          </div>
          <span className="font-extrabold text-base text-[#21262C]">
            Veda<span className="text-[#FF5500]">AI</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#21262C] hover:bg-[#F6F6F6] rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ─── Mobile Backdrop ─── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Mobile Drawer ─── */}
      <div
        className={`md:hidden fixed top-14 left-0 bottom-0 w-64 bg-white border-r border-[#E2E2E2] z-50 transition-transform duration-200 ease-in-out flex flex-col ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavList pathname={pathname} onNavClick={() => setMobileOpen(false)} />
        {sidebarFooter}
      </div>
    </>
  );
}

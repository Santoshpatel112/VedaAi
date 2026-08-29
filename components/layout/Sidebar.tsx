"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  GraduationCap,
  FileText,
  ClipboardList,
  BookOpen,
  Clock,
  Sparkles,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import type { UserSession } from "@/lib/auth/session";
import { useSidebar } from "./SidebarContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Home",          href: "/home",        icon: LayoutGrid   },
  { name: "My Classroom",  href: "/classroom",   icon: GraduationCap},
  { name: "Assignments",   href: "/assignments", icon: FileText     },
  { name: "Exams",         href: "/exams",       icon: ClipboardList},
  { name: "My Library",    href: "/library",     icon: BookOpen     },
  { name: "Settings",      href: "/settings",    icon: Clock        },
];

interface SidebarProps {
  session: UserSession | null;
}

// ── Shared nav list component ──────────────────────────────────────────────
interface NavListProps {
  pathname: string;
  expanded: boolean;
  onClick?: () => void;
}

function NavList({ pathname, expanded, onClick }: NavListProps) {
  return (
    <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const Icon     = item.icon;
        const isActive = pathname.startsWith(item.href);
        const hasNotification = item.name === "Exams";
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClick}
            title={!expanded ? item.name : undefined}
            className={`relative flex items-center gap-3 rounded-xl transition-all duration-150 select-none
              ${expanded ? "px-3 py-2.5" : "justify-center h-10"}
              ${isActive
                ? "bg-[#F5F5F5] text-[#1A1A1A] font-semibold"
                : "text-[#888888] hover:bg-[#F5F5F5] hover:text-[#1A1A1A] font-medium"
              }`}
          >
            <Icon
              className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-[#1A1A1A]" : ""}`}
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            {expanded && (
              <span className="text-sm truncate flex-1">{item.name}</span>
            )}
            {expanded && hasNotification && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] shrink-0" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ session }: SidebarProps) {
  const pathname   = usePathname();
  const router     = useRouter();
  const { expanded, toggle, setExpanded } = useSidebar();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);

  // Default to expanded on desktop for Figma match
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setExpanded(true);
    }
  }, [setExpanded]);

  const schoolName = session?.school;
  const department = session?.department;
  const userLabel  = schoolName ?? session?.name ?? "";
  const initial    = userLabel[0]?.toUpperCase() ?? "?";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
    } catch {
      setLoggingOut(false);
      return;
    }
    router.push("/login");
    router.refresh();
  };

  // ── Desktop sidebar width: collapsed=56px, expanded=220px ─────────────────
  return (
    <>
      {/* ════════════════════ DESKTOP SIDEBAR ════════════════════ */}
      <aside
        className={`hidden md:flex flex-col bg-white min-h-screen m-2 rounded-[16px] shadow-sm
          fixed left-0 top-0 bottom-0 z-30 transition-all duration-200 ease-in-out
          ${expanded ? "w-[220px]" : "w-[60px]"}`}
      >

        {/* ── Header row: Logo + optional brand name + toggle button ── */}
        <div className={`h-14 flex items-center border-b border-[#F0F0F0] shrink-0 ${
          expanded
            ? "px-4 justify-between"
            : "flex-col justify-center gap-2 py-2"
        }`}>
          {/* Logo */}
          <Link
            href="/exams"
            className="w-9 h-9 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-white font-black text-[15px] hover:opacity-90 transition-opacity shrink-0"
            title="VedaAI"
          >
            V
          </Link>

          {/* Brand name — only when expanded */}
          {expanded && (
            <span className="font-extrabold text-[16px] text-[#1A1A1A] tracking-tight flex-1 leading-none ml-2">
              VedaAI
            </span>
          )}

          {/* Toggle button — chevron style */}
          <button
            onClick={toggle}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
            className={`flex items-center justify-center rounded-lg text-[#BBBBBB] hover:bg-[#F5F5F5] hover:text-[#555555] transition-colors shrink-0 ${
              expanded ? "w-7 h-7" : "w-6 h-6"
            }`}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded
              ? <PanelLeftClose className="w-4 h-4" />
              : <PanelLeftOpen  className="w-4 h-4" />
            }
          </button>
        </div>

        {/* ── AI Teacher's Toolkit button — Figma exact (BLACK bg + ORANGE border) ── */}
        <div className={`px-3 pt-3 pb-2 ${expanded ? "" : "flex justify-center"}`}>
          {expanded ? (
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#1A1A1A] border-2 border-[#FF5500] text-white text-xs font-semibold hover:bg-[#2A2A2A] transition-colors shadow-sm">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>AI Teacher&apos;s Toolkit</span>
            </button>
          ) : (
            <button
              title="AI Teacher's Toolkit"
              className="w-9 h-9 rounded-full bg-[#FF5500] flex items-center justify-center text-white hover:bg-[#E04A00] transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Nav items ── */}
        <NavList pathname={pathname} expanded={expanded} />

        {/* ── Bottom: user card / avatar ── */}
        <div className={`mt-auto border-t border-[#F0F0F0] px-2 py-3 ${expanded ? "" : "flex justify-center"}`}>
          {expanded ? (
            <div className="space-y-1">
              {userLabel && (
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#F8F8F8] border border-[#EEEEEE]">
                  <div className="w-8 h-8 rounded-full bg-[#E0E0E0] border border-[#D0D0D0] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#444444]">{initial}</span>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold text-[#1A1A1A] truncate">{schoolName ?? session?.name}</span>
                    {department && <span className="text-[10px] text-[#AAAAAA] truncate">{department}</span>}
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-xs font-medium text-[#AAAAAA] hover:text-[#FF5500] hover:bg-[#FFF3EE] transition-colors disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title={loggingOut ? "Signing out…" : `${userLabel} · Sign out`}
              className="w-9 h-9 rounded-full bg-[#E8E8E8] border border-[#D8D8D8] flex items-center justify-center hover:opacity-75 transition-opacity disabled:opacity-40 shrink-0"
            >
              <span className="text-xs font-bold text-[#444444]">{initial}</span>
            </button>
          )}
        </div>
      </aside>

      {/* ════════════════════ MOBILE: top bar ════════════════════ */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-[#E8E8E8] fixed top-0 left-0 right-0 z-40">
        <Link href="/exams" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-white font-black text-sm">V</div>
          <span className="font-extrabold text-base text-[#1A1A1A] tracking-tight">VedaAI</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-8 h-8 flex items-center justify-center text-[#555555] hover:bg-[#F5F5F5] rounded-lg transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile full drawer */}
      <div className={`md:hidden fixed top-14 left-0 bottom-0 w-64 bg-white border-r border-[#E8E8E8] z-50 flex flex-col transition-transform duration-200 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-3 pt-4 pb-2">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#1A1A1A] border-2 border-[#FF5500] text-white text-xs font-semibold hover:bg-[#2A2A2A] transition-colors shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Teacher&apos;s Toolkit</span>
          </button>
        </div>

        <NavList pathname={pathname} expanded={true} onClick={() => setMobileOpen(false)} />

        <div className="mt-auto px-3 pb-4 space-y-2">
          {userLabel && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F8F8] border border-[#EEEEEE]">
              <div className="w-9 h-9 rounded-full bg-[#E8E8E8] border border-[#D8D8D8] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#444444]">{initial}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1A1A1A] truncate">{schoolName ?? session?.name}</span>
                {department && <span className="text-[11px] text-[#999999] truncate">{department}</span>}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#999999] hover:text-[#FF5500] hover:bg-[#FFF3EE] transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>
          </button>
        </div>
      </div>
    </>
  );
}

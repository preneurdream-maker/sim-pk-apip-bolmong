"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, ClipboardCheck, Users,
  FolderOpen, BarChart3, CheckSquare, LogOut,
  ShieldCheck, ChevronRight, ListChecks
} from "lucide-react";
import { cn, ROLE_CONFIG } from "@/lib/utils";

const NAV_ITEMS = {
  dashboard:  { label: "Dashboard",     icon: LayoutDashboard, href: (r) => `/${r.toLowerCase()}/dashboard` },
  kka:        { label: "KKA Editor",    icon: FileText,         href: () => "/auditor/kka" },
  review:     { label: "Reviu KKA",     icon: ClipboardCheck,   href: () => "/dalnis/review" },
  approval:   { label: "Persetujuan",   icon: CheckSquare,      href: () => "/irban/approval" },
  users:      { label: "Kelola User",   icon: Users,            href: () => "/admin/users" },
  repository: { label: "Repository PK",icon: FolderOpen,        href: () => "/repository" },
  sdm:        { label: "Data SDM",      icon: BarChart3,        href: () => "/admin/sdm" },
  tlhp:       { label: "Portal TLHP",  icon: ListChecks,        href: () => "/opd/tlhp" },
  wbs:        { label: "Dashboard WBS", icon: BarChart3,        href: () => "/opd/wbs" },
};

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role     = session?.user?.role || "AUDITOR";
  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG.AUDITOR;

  const navKeys = roleConf.nav || ["dashboard"];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-sm">

      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-slate-900">SIM-PK APIP</p>
          <p className="text-[10px] text-slate-500">Kab. Bolaang Mongondow</p>
        </div>
      </div>

      {/* User Info */}
      <div className="mx-3 my-3 rounded-lg bg-slate-50 px-4 py-3">
        <div className={cn("text-xs font-bold uppercase tracking-wider", roleConf.color)}>
          {roleConf.label}
        </div>
        <p className="mt-0.5 text-sm font-semibold text-slate-800 truncate">
          {session?.user?.fullName || "Pengguna"}
        </p>
        {session?.user?.nip && (
          <p className="text-xs text-slate-500">NIP: {session.user.nip}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Menu Utama
        </p>
        <ul className="space-y-1">
          {navKeys.map((key) => {
            const item   = NAV_ITEMS[key];
            if (!item) return null;
            const href   = item.href(role);
            const active = pathname.startsWith(href);
            return (
              <li key={key}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="h-3 w-3 opacity-70" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm
            font-medium text-red-600 transition-all hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Keluar dari Sistem
        </button>
      </div>
    </aside>
  );
}

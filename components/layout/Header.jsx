"use client";

import { useSession } from "next-auth/react";
import { Bell, Search } from "lucide-react";
import { ROLE_CONFIG } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Header({ title, subtitle }) {
  const { data: session } = useSession();
  const role     = session?.user?.role || "AUDITOR";
  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG.AUDITOR;

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Title */}
      <div>
        <h1 className="text-base font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span className={cn(
          "hidden rounded-full border px-3 py-1 text-xs font-semibold sm:inline-block",
          role === "AUDITOR" && "border-blue-200 bg-blue-50 text-blue-700",
          role === "DALNIS"  && "border-amber-200 bg-amber-50 text-amber-700",
          role === "IRBAN"   && "border-green-200 bg-green-50 text-green-700",
          role === "ADMIN"   && "border-purple-200 bg-purple-50 text-purple-700",
          role === "OPD"     && "border-pink-200 bg-pink-50 text-pink-700",
          role === "BPKP"    && "border-gray-200 bg-gray-50 text-gray-700",
        )}>
          {roleConf.label}
        </span>

        {/* Notification */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg
          text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {session?.user?.fullName?.charAt(0) || "U"}
        </div>
      </div>
    </header>
  );
}

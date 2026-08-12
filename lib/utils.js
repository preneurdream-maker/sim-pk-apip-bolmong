import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format angka ke format Rupiah
export function formatRupiah(value) {
  if (!value) return "";
  const number = value.toString().replace(/\D/g, "");
  return new Intl.NumberFormat("id-ID").format(parseInt(number, 10) || 0);
}

// Parse Rupiah string ke integer
export function parseRupiah(value) {
  return parseInt(value.replace(/\D/g, ""), 10) || 0;
}

// Status badge config
export const KKA_STATUS_CONFIG = {
  DRAFT:                 { label: "Draft",                 color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  SUBMITTED:             { label: "Submitted",             color: "bg-blue-100 text-blue-800 border-blue-200"   },
  REVISION:              { label: "Dalam Revisi",          color: "bg-red-100 text-red-800 border-red-200"      },
  REVISION_REQUESTED:    { label: "Diminta Revisi",        color: "bg-rose-100 text-rose-800 border-rose-200"   },
  APPROVED_BY_KETUA_TIM: { label: "Disetujui Ketua Tim",   color: "bg-teal-100 text-teal-800 border-teal-200"   },
  APPROVED_BY_DALNIS:    { label: "Disetujui Dalnis/Irban",color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  APPROVED:              { label: "Approved Final",        color: "bg-green-100 text-green-800 border-green-200" },
};

export const ROLE_CONFIG = {
  AUDITOR: { label: "Auditor",                    color: "text-blue-600",   nav: ["dashboard","kka"] },
  IRBAN:   { label: "Irban / Pengendali Teknis",  color: "text-amber-600",  nav: ["dashboard","kka","review","approval"] },
  ADMIN:   { label: "Admin",                      color: "text-purple-600", nav: ["dashboard","kka","review","approval","users","repository","sdm"] },
  OPD:     { label: "OPD Auditee",                color: "text-pink-600",   nav: ["tlhp","wbs"] },
  BPKP:    { label: "Evaluator BPKP",             color: "text-gray-600",   nav: ["dashboard","repository"] },
};

// Redirect path per role setelah login
export function getRoleDashboardPath(role) {
  const paths = {
    AUDITOR:   "/auditor/dashboard",
    KETUA_TIM: "/workspace/ketua-tim",
    IRBAN:     "/workspace/irban-dalnis",
    ADMIN:     "/admin/pk-apip",
    OPD:       "/opd/tlhp",
    BPKP:      "/bpkp/dashboard",
  };
  return paths[role] || "/workspace/inspektur";
}

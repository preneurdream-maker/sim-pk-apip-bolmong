import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import {
  FileText, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, PlusCircle, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { KKA_STATUS_CONFIG } from "@/lib/utils";

export const metadata = {
  title: "Dashboard Auditor — SIM-PK APIP",
};

export default async function AuditorDashboardPage() {
  const session = await auth();

  // Fetch KKA stats for this auditor
  const [draftCount, submittedCount, revisionCount, approvedCount, recentKKA] =
    await Promise.all([
      prisma.kKA.count({ where: { createdById: session.user.id, status: "DRAFT" } }),
      prisma.kKA.count({ where: { createdById: session.user.id, status: "SUBMITTED" } }),
      prisma.kKA.count({ where: { createdById: session.user.id, status: "REVISION" } }),
      prisma.kKA.count({ where: { createdById: session.user.id, status: "APPROVED" } }),
      prisma.kKA.findMany({
        where:   { createdById: session.user.id },
        orderBy: { updatedAt: "desc" },
        take:    5,
        include: { engagement: { select: { title: true } } },
      }),
    ]);

  const STATS = [
    { label: "Draft",     count: draftCount,     status: "DRAFT",     icon: FileText,     bg: "bg-yellow-50 border-yellow-200", icon_color: "text-yellow-600" },
    { label: "Submitted", count: submittedCount,  status: "SUBMITTED", icon: Clock,        bg: "bg-blue-50 border-blue-200",    icon_color: "text-blue-600"   },
    { label: "Revisi",    count: revisionCount,   status: "REVISION",  icon: AlertTriangle,bg: "bg-red-50 border-red-200",      icon_color: "text-red-600"    },
    { label: "Approved",  count: approvedCount,   status: "APPROVED",  icon: CheckCircle2, bg: "bg-green-50 border-green-200",  icon_color: "text-green-600"  },
  ];

  return (
    <>
      <Header
        title="Dashboard Auditor"
        subtitle={`Selamat datang, ${session.user.fullName}`}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Welcome Banner */}
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-sm">Selamat datang kembali,</p>
              <h2 className="text-xl font-bold mt-0.5">{session.user.fullName}</h2>
              {session.user.nip && (
                <p className="text-blue-200 text-sm mt-1">NIP: {session.user.nip}</p>
              )}
            </div>
            <TrendingUp className="h-8 w-8 text-blue-300 opacity-60" />
          </div>
          <div className="mt-4">
            <Link
              href="/auditor/kka/new"
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2
                text-sm font-semibold text-white transition-all hover:bg-white/30"
            >
              <PlusCircle className="h-4 w-4" />
              Buat KKA Baru
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.status}
                className={`rounded-xl border p-5 ${stat.bg} transition-all hover:shadow-md`}>
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${stat.icon_color}`} />
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${KKA_STATUS_CONFIG[stat.status].color}`}>
                    {KKA_STATUS_CONFIG[stat.status].label}
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{stat.count}</p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Recent KKA Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="font-semibold text-slate-900">KKA Terbaru</h3>
            <Link href="/auditor/kka"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
              Lihat Semua <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {recentKKA.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="font-medium">Belum ada KKA</p>
              <p className="text-sm mt-1">Mulai dengan membuat KKA pertama Anda</p>
              <Link href="/auditor/kka/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600
                  px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                <PlusCircle className="h-4 w-4" /> Buat KKA
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Penugasan</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Diperbarui</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentKKA.map((kka) => {
                  const statusConf = KKA_STATUS_CONFIG[kka.status];
                  return (
                    <tr key={kka.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 truncate max-w-xs">
                          {kka.engagement?.title || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(kka.updatedAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/auditor/kka/${kka.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700">
                          Buka →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </>
  );
}

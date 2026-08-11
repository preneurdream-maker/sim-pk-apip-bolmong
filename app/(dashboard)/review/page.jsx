import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import { ShieldCheck, Clock, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { KKA_STATUS_CONFIG } from "@/lib/utils";

export const metadata = {
  title: "Daftar Reviu KKA — SIM-PK APIP",
};

export default async function ReviewListPage() {
  const session = await auth();

  // Fetch KKAs that require review (SUBMITTED, REVISION_REQUESTED, APPROVED_BY_KETUA_TIM, etc.)
  const pendingKKAs = await prisma.kKA.findMany({
    orderBy: { updatedAt: "desc text" },
    include: {
      engagement: { select: { title: true, type: true } },
      createdBy:  { select: { fullName: true, role: true } },
      _count:     { select: { evidens: true, reviews: true } },
    },
  });

  return (
    <>
      <Header
        title="Daftar Reviu KKA & QA Workspace"
        subtitle="Ruang Kerja Reviu Berjenjang Ketua Tim & Dalnis (Irban)"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Info Banner */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-blue-900">QA Reviu Berjenjang (Peraturan BPKP No. 6 Tahun 2025)</h2>
            <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
              Sebagai Ketua Tim / Pengendali Teknis (Irban), Anda dapat memeriksa 5 komponen RCA KKA auditor, memberikan catatan koreksi per bagian, menyetujui, atau meminta revisi.
            </p>
          </div>
        </div>

        {/* KKA Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-sm">Semua Penugasan & KKA Masuk</h3>
            <span className="text-xs text-slate-500 font-medium">Total: {pendingKKAs.length} KKA</span>
          </div>

          {pendingKKAs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText className="mx-auto mb-2 h-10 w-10 opacity-30" />
              <p className="font-medium text-sm">Belum ada KKA yang dikirim auditor</p>
              <p className="text-xs mt-1">KKA yang di-submit auditor akan muncul di sini</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-3.5 text-left">Penugasan Audit</th>
                  <th className="px-6 py-3.5 text-left">Auditor Pembuat</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-center">Catatan Reviu</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingKKAs.map((kka) => {
                  const statusConf = KKA_STATUS_CONFIG[kka.status || "SUBMITTED"];
                  return (
                    <tr key={kka.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 truncate max-w-xs text-sm">
                          {kka.engagement?.title || "Penugasan Audit"}
                        </p>
                        <p className="text-[10px] text-slate-400">ID KKA: {kka.id}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {kka.createdBy?.fullName || "Auditor"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 font-bold ${statusConf?.color}`}>
                          {statusConf?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">
                        {kka._count?.reviews || 0} catatan
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/review/${kka.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700 transition-all shadow-sm"
                        >
                          Buka Workspace Reviu <ArrowRight className="h-3.5 w-3.5" />
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

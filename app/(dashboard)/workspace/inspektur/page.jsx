"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import {
  TrendingUp, ShieldAlert, DollarSign, Award, CheckCircle2,
  AlertTriangle, Building2, Flame, Sparkles, Send, Loader2,
  BarChart3, PieChart, Activity, CheckSquare
} from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";

const OPD_RISK_HEATMAP = [
  { opd: "Dinas Pekerjaan Umum & PR", risk: "TINGGI", score: 88, totalLoss: "450000000", findingsCount: 8 },
  { opd: "Dinas Kesehatan", risk: "SEDANG", score: 65, totalLoss: "57500000", findingsCount: 4 },
  { opd: "Dinas Pendidikan", risk: "SEDANG", score: 62, totalLoss: "42000000", findingsCount: 5 },
  { opd: "Dinas Pertanian", risk: "RENDAH", score: 35, totalLoss: "0", findingsCount: 1 },
  { opd: "Badan Pengelola Keuangan (BPKPD)", risk: "RENDAH", score: 28, totalLoss: "0", findingsCount: 0 },
];

const STRATEGIC_LHPS = [
  { id: "slhp-1", title: "LHP Investigasi Khusus Pembangunan Puskesmas Dumoga", noLhp: "700/LHP-INVES/01/2026", status: "MENUNGGU_APPROVAL_INSPEKTUR", loss: "185000000" },
  { id: "slhp-2", title: "LHP Audit Kinerja Efektivitas Pengadaan Alkes", noLhp: "700/LHP-KINERJA/02/2026", status: "APPROVED", loss: "0" },
];

export default function InspekturWorkspacePage() {
  const [strategicLhps, setStrategicLhps] = useState(STRATEGIC_LHPS);
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  const handleOneClickApproval = (id) => {
    setStrategicLhps((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "APPROVED" } : l))
    );
    setApprovedSuccess(true);
    setTimeout(() => setApprovedSuccess(false), 3000);
  };

  return (
    <>
      <Header
        title="Executive Dashboard Inspektur Daerah (SIM-Atensi)"
        subtitle="Pusat Kendali Pengawasan Strategis, Executive Heatmap, & Pemulihan Keuangan Daerah"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Financial Recovery Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-0.5 rounded-full text-xs font-semibold">
                  SIM-Atensi Executive Overview
                </span>
                <h2 className="text-xl font-bold mt-1">Pemulihan Keuangan Daerah (Kas Daerah)</h2>
              </div>
              <TrendingUp className="h-10 w-10 text-emerald-400 opacity-60" />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-xs text-slate-400">Total Kerugian Daerah Ditentukan (2026)</p>
                <p className="text-2xl font-black text-rose-400 mt-0.5">Rp {formatRupiah(549500000)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Pemulihan Disetor ke Kas Daerah</p>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">Rp {formatRupiah(312000000)}</p>
                <p className="text-[10px] text-emerald-300 mt-0.5">✓ Capaian Pengembalian: 56.7%</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Performa Tim APIP</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Maturitas SPIP & PK APIP</h3>
              <p className="text-xs text-slate-500 mt-1">Skor Keterpenuhan Level 3 (Optimal) Peraturan BPKP No. 6/2025</p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-3xl font-black text-slate-900">3.85</p>
                <p className="text-[10px] text-slate-400">Target Maturitas Level 3+</p>
              </div>
              <span className="bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full text-xs">LEVEL 3 (MAJU)</span>
            </div>
          </div>

        </div>

        {/* Heatmap Card: OPD Risk Mapping */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-5 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-600" /> Executive Heatmap: Pemetaan Risiko OPD Auditee
              </h3>
              <p className="text-xs text-slate-500">Berdasarkan akumulasi nilai kerugian daerah & frekuensi temuan audit</p>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b">
              <tr>
                <th className="px-6 py-3.5">Perangkat Daerah (OPD)</th>
                <th className="px-6 py-3.5">Tingkat Risiko</th>
                <th className="px-6 py-3.5">Skor Indeks Risiko</th>
                <th className="px-6 py-3.5">Akumulasi Temuan Kerugian</th>
                <th className="px-6 py-3.5 text-right">Jumlah Temuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {OPD_RISK_HEATMAP.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.opd}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 font-bold text-[11px]",
                      item.risk === "TINGGI" && "bg-red-100 text-red-800 border border-red-200",
                      item.risk === "SEDANG" && "bg-amber-100 text-amber-800 border border-amber-200",
                      item.risk === "RENDAH" && "bg-green-100 text-green-800 border border-green-200"
                    )}>
                      {item.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{item.score} / 100</td>
                  <td className="px-6 py-4 font-bold text-red-600">
                    {parseInt(item.totalLoss) > 0 ? `Rp ${formatRupiah(item.totalLoss)}` : "Rp 0"}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-700">{item.findingsCount} Temuan</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* One-Click Approval Card for Strategic LHPs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> One-Click Executive Approval (LHP Investigasi Khusus)
              </h3>
              <p className="text-xs text-slate-500">Persetujuan langsung LHP Audit Investigasi Khusus oleh Inspektur Daerah</p>
            </div>
          </div>

          {approvedSuccess && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-bold text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> LHP Investigasi Khusus Berhasil Disetujui Oleh Inspektur Daerah!
            </div>
          )}

          <div className="space-y-3">
            {strategicLhps.map((lhp) => (
              <div key={lhp.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-[11px] text-blue-700 font-bold">{lhp.noLhp}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{lhp.title}</h4>
                  {parseInt(lhp.loss) > 0 && (
                    <p className="text-[11px] text-red-600 font-bold mt-1">Indikasi Kerugian: Rp {formatRupiah(lhp.loss)}</p>
                  )}
                </div>

                <div>
                  {lhp.status === "APPROVED" ? (
                    <span className="bg-green-100 text-green-800 font-bold px-3 py-1.5 rounded-lg border border-green-200 inline-block">
                      ✓ Disetujui Inspektur
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOneClickApproval(lhp.id)}
                      className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-all shadow"
                    >
                      <CheckSquare className="h-4 w-4" /> One-Click Approve LHP
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

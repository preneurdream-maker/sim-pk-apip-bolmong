"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import {
  ShieldCheck, FileSpreadsheet, CheckCircle2, AlertTriangle, Send,
  FileCheck2, Building2, CheckSquare, Clock, Globe, Award, Sparkles
} from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";

export default function IrbanDalnisWorkspacePage() {
  const [activeTab,     setActiveTab]     = useState("dalnis"); // "dalnis" | "irban"
  const [buktiCheck,    setBuktiCheck]    = useState(true);
  const [rcaCheck,      setRcaCheck]      = useState(true);
  const [pkaCheck,      setPkaCheck]      = useState(true);
  const [dalnisNotes,   setDalnisNotes]   = useState("");
  const [isDalnisApproved, setIsDalnisApproved] = useState(false);

  // Irban Tab State
  const [noLhp,         setNoLhp]         = useState("700/LHP-IRBAN1/02/2026");
  const [isPublished,   setIsPublished]   = useState(false);
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  const handleApproveDalnis = () => {
    setIsDalnisApproved(true);
  };

  const handlePublishToOpd = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsPublished(true);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <Header
        title="Workspace Irban / Dalnis (Pengendali Teknis & Wilayah)"
        subtitle="Level 2 Quality Control Dalnis & Penomoran Resmi LHP Wilayah Irban"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Dual Tab Header */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("dalnis")}
            className={cn("flex items-center gap-2 rounded-lg px-5 py-2.5 transition-all",
              activeTab === "dalnis" ? "bg-amber-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <ShieldCheck className="h-4 w-4" /> TAB 1: QA Review KKA (Dalnis)
          </button>
          <button
            onClick={() => setActiveTab("irban")}
            className={cn("flex items-center gap-2 rounded-lg px-5 py-2.5 transition-all",
              activeTab === "irban" ? "bg-emerald-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <FileSpreadsheet className="h-4 w-4" /> TAB 2: Approval LHP Wilayah (Irban)
          </button>
        </div>

        {/* ── TAB 1: QA REVIEW KKA (DALNIS LEVEL 2 QC) ── */}
        {activeTab === "dalnis" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* KKA Overview */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold font-mono text-amber-600">KKA-01 / 2026</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">Kelebihan Pembayaran Belanja Modal Gedung PU</h3>
                </div>
                <span className="bg-teal-100 text-teal-800 font-bold px-3 py-1 rounded-full text-xs">
                  APPROVED_BY_KT
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-800">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs">Kondisi & Akar Masalah (5 Whys):</h4>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    Ditemukan selisih fisik belanja modal gedung kantor sebesar Rp 45.000.000. Akar masalah disebabkan oleh PPHP yang tidak melakukan pengukuran ulang fisik di lapangan.
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs">Nilai Kerugian Daerah:</h4>
                  <p className="mt-1 font-bold text-red-600 text-sm">Rp 45.000.000</p>
                </div>
              </div>
            </div>

            {/* QA Checklist Form Dalnis */}
            <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm space-y-5 text-xs">
              <h3 className="font-bold text-amber-900 text-sm flex items-center gap-1.5 border-b pb-3">
                <CheckSquare className="h-4 w-4 text-amber-600" /> Form Checklist QA Mutu (Dalnis)
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer font-semibold">
                  <span>1. Ketersediaan Bukti Audit Lengkap</span>
                  <input
                    type="checkbox" checked={buktiCheck} onChange={(e) => setBuktiCheck(e.target.checked)}
                    className="h-4 w-4 accent-amber-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer font-semibold">
                  <span>2. Kedalaman Root Cause Analysis (Sebab)</span>
                  <input
                    type="checkbox" checked={rcaCheck} onChange={(e) => setRcaCheck(e.target.checked)}
                    className="h-4 w-4 accent-amber-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer font-semibold">
                  <span>3. Kesesuaian dengan Prosedur PKA</span>
                  <input
                    type="checkbox" checked={pkaCheck} onChange={(e) => setPkaCheck(e.target.checked)}
                    className="h-4 w-4 accent-amber-600 rounded"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Catatan Pengendali Teknis (Dalnis)</label>
                <textarea
                  rows={3} value={dalnisNotes} onChange={(e) => setDalnisNotes(e.target.value)}
                  placeholder="Catatan penjaminan mutu KKA..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {isDalnisApproved && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" /> KKA Disetujui Dalnis (APPROVED_BY_DALNIS)
                </div>
              )}

              <button
                onClick={handleApproveDalnis} disabled={isDalnisApproved}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 font-bold text-white hover:bg-amber-700 disabled:opacity-60 transition-all shadow"
              >
                <ShieldCheck className="h-4 w-4" /> Setujui QA KKA (Dalnis)
              </button>
            </div>

          </div>
        )}

        {/* ── TAB 2: APPROVAL LHP WILAYAH (IRBAN) ── */}
        {activeTab === "irban" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
            <div className="border-b pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Persetujuan & Penomoran Resmi Irban</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Laporan Hasil Pengawasan (LHP) Wilayah I</h2>
              </div>
              <Building2 className="h-10 w-10 text-emerald-600 opacity-30" />
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Nomor LHP Input */}
              <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="block font-bold text-slate-800">Nomor LHP Resmi Wilayah (Format Baku Inspektorat)</label>
                <input
                  type="text" value={noLhp} onChange={(e) => setNoLhp(e.target.value)}
                  placeholder="Contoh: 700/LHP-IRBAN1/02/2026"
                  className="w-full rounded-lg border border-slate-300 p-3 font-mono font-bold text-sm text-emerald-900 bg-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* Publish to e-TLHP OPD Card */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
                <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-600" /> Publikasikan LHP ke Portal e-TLHP OPD
                </h4>
                <p className="text-emerald-800 leading-relaxed">
                  Menekan tombol publikasi akan secara otomatis mengirimkan rekomendasi LHP ke Portal OPD terkait (Dinas PU / Dinas Kesehatan) dan mengaktifkan <strong className="text-emerald-950">Countdown Batas Waktu 60 Hari</strong>.
                </p>

                {isPublished && (
                  <div className="rounded-lg bg-green-600 text-white p-4 font-bold text-xs flex items-center gap-2 shadow">
                    <CheckCircle2 className="h-5 w-5" /> LHP Berhasil Dipublikasikan ke Portal e-TLHP OPD Auditee!
                  </div>
                )}

                <button
                  onClick={handlePublishToOpd} disabled={isSubmitting || isPublished}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-md"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {isPublished ? "✓ Sudah Dipublikasikan ke OPD" : "Publikasikan LHP ke e-TLHP OPD"}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}

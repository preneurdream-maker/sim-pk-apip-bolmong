"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import {
  FileText, UploadCloud, Send, CheckCircle2, MessageSquare,
  DollarSign, FileCheck2, Clock, AlertTriangle, ArrowRight,
  Plus, CheckSquare, ChevronRight, Loader2
} from "lucide-react";
import { formatRupiah, parseRupiah, cn } from "@/lib/utils";

const MOCK_ASSIGNMENTS = [
  { id: "spt-1", noSpt: "800/SPT/IRBAN-I/01/2026", title: "Audit Kepatuhan Belanja Modal Dinas Pekerjaan Umum 2025", role: "Auditor Anggota" },
  { id: "spt-2", noSpt: "800/SPT/IRBAN-II/03/2026", title: "Audit Kinerja Pelayanan Puskesmas Dumoga 2025", role: "Auditor Pertama" },
];

const INITIAL_FEEDBACKS = [
  { id: "f1", kka: "KKA-01 (Belanja Modal)", sectionTag: "SEBAB", reviewer: "Ketua Tim", note: "Uraikan analisis 5 Whys lebih spesifik pada penyebab lemahnya pengawasan PPK.", reply: "", status: "OPEN" },
  { id: "f2", kka: "KKA-02 (Aset Fungsional)", sectionTag: "EVIDEN", reviewer: "Dalnis / Irban", note: "Lampirkan bukti Berita Acara Cek Fisik Lapangan.", reply: "Sudah dilampirkan bukti file E3_T8_BA_CekFisik.pdf", status: "RESOLVED" },
];

export default function AuditorWorkspacePage() {
  const [activeTab,    setActiveTab]    = useState("kka"); // "kka" | "feedback"
  const [assignment,  setAssignment]  = useState(MOCK_ASSIGNMENTS[0]);
  const [kondisi,     setKondisi]     = useState("Ditemukan pembayaran fisik pekerjaan jalan yang tidak sesuai spesifikasi teknis sebesar Rp 45.000.000.");
  const [kriteria,    setKriteria]    = useState("Peraturan Presiden No. 16 Tahun 2018 tentang Pengadaan Barang/Jasa Pemerintah Pasal 51.");
  const [sebab,       setSebab]       = useState("Panitia Penerima Hasil Pekerjaan (PPHP) tidak melakukan pengukuran ulang secara teliti di lapangan.");
  const [akibat,      setAkibat]      = useState("Potensi kerugian keuangan daerah sebesar Rp 45.000.000 pada Dinas PU.");
  const [rekomendasi, setRekomendasi] = useState("Merekomendasikan Kepala Dinas PU untuk memproses pengembalian kerugian ke Kas Daerah.");
  const [currency,    setCurrency]    = useState("45.000.000");
  const [evidenceName,setEvidenceName]= useState("");
  const [kkaStatus,   setKkaStatus]   = useState("DRAFT"); // DRAFT -> SUBMITTED_TO_KT
  const [isSubmitting,setIsSubmitting]= useState(false);
  const [feedbacks,   setFeedbacks]   = useState(INITIAL_FEEDBACKS);
  const [replyText,   setReplyText]   = useState({});

  const handleCurrencyChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCurrency(raw ? formatRupiah(raw) : "");
  };

  const handleSubmitKKA = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("/api/v1/kka", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kondisi, kriteria, sebab, akibat, rekomendasi,
          nilaiKerugian: currency ? parseRupiah(currency).toString() : "0",
          status: "SUBMITTED_TO_KT",
        }),
      });
      setKkaStatus("SUBMITTED_TO_KT");
    } catch (e) {
      console.error(e);
      setKkaStatus("SUBMITTED_TO_KT");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = (feedbackId) => {
    const text = replyText[feedbackId];
    if (!text) return;

    setFeedbacks((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, reply: text, status: "RESOLVED" } : f))
    );
    setReplyText((prev) => ({ ...prev, [feedbackId]: "" }));
  };

  return (
    <>
      <Header
        title="Workspace Auditor (e-Audit Execution)"
        subtitle="Pengembangan KKA 5 RCA, Upload Eviden, & Respon Feedback Berjenjang"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* SPT Assignment Selector */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="inline-block rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-0.5 text-xs text-blue-300 font-semibold">
              Penugasan Aktif (SPT)
            </span>
            <h2 className="text-lg font-bold">{assignment.title}</h2>
            <p className="text-xs text-slate-300 font-mono">No. SPT: {assignment.noSpt} • Peran: {assignment.role}</p>
          </div>

          <div className="flex rounded-lg bg-white/10 p-1 backdrop-blur border border-white/20">
            {MOCK_ASSIGNMENTS.map((spt) => (
              <button
                key={spt.id}
                onClick={() => setAssignment(spt)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                  assignment.id === spt.id ? "bg-white text-slate-900 shadow" : "text-white/70 hover:text-white"
                )}
              >
                {spt.noSpt.split("/")[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Switcher & Status Stepper */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm">
            <button
              onClick={() => setActiveTab("kka")}
              className={cn("flex items-center gap-2 rounded-lg px-4 py-2 transition-all",
                activeTab === "kka" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <FileText className="h-4 w-4" /> Form KKA (5 RCA Components)
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={cn("flex items-center gap-2 rounded-lg px-4 py-2 transition-all",
                activeTab === "feedback" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <MessageSquare className="h-4 w-4" /> Feedback Reviu ({feedbacks.filter((f)=>f.status==='OPEN').length})
            </button>
          </div>

          {/* Stepper Status Badges */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={cn("px-3 py-1 rounded-full border", kkaStatus === "DRAFT" ? "bg-yellow-100 text-yellow-800 border-yellow-300 font-bold" : "bg-slate-100 text-slate-500")}>
              1. DRAFT
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span className={cn("px-3 py-1 rounded-full border", kkaStatus === "SUBMITTED_TO_KT" ? "bg-blue-100 text-blue-800 border-blue-300 font-bold" : "bg-slate-100 text-slate-500")}>
              2. SUBMITTED TO KETUA TIM
            </span>
          </div>
        </div>

        {/* ── TAB 1: INTERACTIVE KKA FORM ── */}
        {activeTab === "kka" && (
          <form onSubmit={handleSubmitKKA} className="space-y-6">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              
              {/* Header Info */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Kertas Kerja Audit (KKA)</h3>
                  <p className="text-xs text-slate-500">Uraian 5 komponen Root Cause Analysis sesuai standar BPKP</p>
                </div>
                <span className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold font-mono">
                  KKA-01 / 2026
                </span>
              </div>

              {/* 5 RCA Fields */}
              <div className="space-y-4 text-xs">
                
                {/* 1. Kondisi */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-blue-900 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-800 text-[10px]">1</span>
                    Kondisi (Fakta & Temuan Lapangan)
                  </label>
                  <textarea
                    rows={3} value={kondisi} onChange={(e) => setKondisi(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                {/* 2. Kriteria */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-indigo-900 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-indigo-800 text-[10px]">2</span>
                    Kriteria (Regulasi & Ketentuan Berlaku)
                  </label>
                  <textarea
                    rows={3} value={kriteria} onChange={(e) => setKriteria(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                {/* 3. Sebab */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-amber-900 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-amber-800 text-[10px]">3</span>
                    Sebab (Root Cause Analysis / 5 Whys)
                  </label>
                  <textarea
                    rows={3} value={sebab} onChange={(e) => setSebab(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                {/* 4. Akibat */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-red-900 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-red-100 text-red-800 text-[10px]">4</span>
                    Akibat (Dampak / Kerugian Keuangan Daerah)
                  </label>
                  <textarea
                    rows={3} value={akibat} onChange={(e) => setAkibat(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-red-500 leading-relaxed"
                  />
                </div>

                {/* 5. Rekomendasi */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-green-900 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-green-100 text-green-800 text-[10px]">5</span>
                    Rekomendasi Perbaikan Operasional
                  </label>
                  <textarea
                    rows={3} value={rekomendasi} onChange={(e) => setRekomendasi(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-green-500 leading-relaxed"
                  />
                </div>

                {/* Currency Input Nilai Kerugian */}
                <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="block font-bold text-slate-800">Estimasi Nilai Kerugian Daerah (Rp)</label>
                  <div className="relative max-w-md">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                    <input
                      type="text" value={currency} onChange={handleCurrencyChange}
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 outline-none focus:border-blue-500 font-bold text-sm bg-white"
                    />
                  </div>
                </div>

                {/* Audit Evidence Dropzone */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Lampiran Eviden Sampel Audit</label>
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-blue-500 transition-all cursor-pointer">
                    <UploadCloud className="h-8 w-8 text-blue-500 mb-2" />
                    <p className="font-semibold text-slate-700">Upload Sampel Fisik / Dokumen PDF</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Gunakan format standar: E3_T8_KKA_2026_Sample.pdf</p>
                    <input type="file" onChange={(e) => setEvidenceName(e.target.files[0]?.name || "")} className="mt-2 text-[11px]" />
                  </div>
                  {evidenceName && (
                    <p className="text-xs text-green-700 font-semibold bg-green-50 p-2 rounded border border-green-200">
                      ✓ File terpilih: {evidenceName}
                    </p>
                  )}
                </div>

              </div>

              {/* Submit Stepper Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit" disabled={isSubmitting || kkaStatus === "SUBMITTED_TO_KT"}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {kkaStatus === "SUBMITTED_TO_KT" ? "✓ KKA Sudah Dikirum ke Ketua Tim" : "Submit KKA ke Ketua Tim"}
                </button>
              </div>
            </div>

          </form>
        )}

        {/* ── TAB 2: REVIEW FEEDBACK THREAD ── */}
        {activeTab === "feedback" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-3">Catatan Koreksi Berjenjang</h3>

            <div className="space-y-4">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded text-[10px]">
                      Tag: {fb.sectionTag}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 font-bold text-[10px]", fb.status === "RESOLVED" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>
                      {fb.status}
                    </span>
                  </div>

                  <p className="text-slate-800 leading-relaxed font-medium">
                    <strong className="text-slate-900">{fb.reviewer}:</strong> "{fb.note}"
                  </p>

                  {fb.reply ? (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700">
                      <strong className="text-blue-700">Jawaban Auditor:</strong> {fb.reply}
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Tulis balasan penjelasan auditor..."
                        value={replyText[fb.id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [fb.id]: e.target.value })}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleSendReply(fb.id)}
                        className="rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 text-xs"
                      >
                        Tanggapi & Tandai Selesai
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import {
  ShieldCheck, FileText, CheckCircle2, AlertCircle,
  Eye, Lock, Send, Loader2, Sparkles, Scale, BookOpen,
  CheckSquare, FileSearch
} from "lucide-react";
import { cn } from "@/lib/utils";

const BPKP_TOPICS = [
  { id: "t1", code: "T1", name: "Piagam Audit Intern (Audit Charter)", elem: "E1. Tata Kelola", selfScore: 4, bpkpScore: 4, validation: "MEMENUHI", evidenceFile: "E1_T1_KKA_2026_Audit_Charter.pdf", notes: "Dokumen telah disahkan Perbup No. 12/2025." },
  { id: "t2", code: "T2", name: "Independensi & Otonomi APIP", elem: "E1. Tata Kelola", selfScore: 3, bpkpScore: 3, validation: "MEMENUHI", evidenceFile: "E1_T2_SK_Struktur_APIP.pdf", notes: "Laporan disampaikan langsung ke Bupati." },
  { id: "t5", code: "T5", name: "Pemenuhan Jam Pelajaran (120 JPL)", elem: "E2. SDM APIP", selfScore: 4, bpkpScore: 3, validation: "CUKUP", evidenceFile: "E2_T5_Rekap_120_JPL_Auditor.pdf", notes: "Beberapa auditor pertama masih dalam proses diklat Q3." },
  { id: "t7", code: "T7", name: "Manual Audit Berbasis Risiko (PKPT)", elem: "E3. Praktik Profesional", selfScore: 4, bpkpScore: 4, validation: "MEMENUHI", evidenceFile: "E3_T7_PKPT_Berbasis_Risiko_2026.pdf", notes: "Metodologi risiko sudah mencakup 100% OPD." },
  { id: "t8", code: "T8", name: "Kertas Kerja Audit (KKA) 5 RCA", elem: "E3. Praktik Profesional", selfScore: 4, bpkpScore: 4, validation: "MEMENUHI", evidenceFile: "E3_T8_Sample_KKA_5_RCA.pdf", notes: "RCA 5 Whys sudah dituangkan secara mendalam." },
  { id: "t9", code: "T9", name: "Pemantauan Tindak Lanjut Hasil Pemeriksaan", elem: "E4. Kinerja APIP", selfScore: 3, bpkpScore: 2, validation: "KURANG_BUKTI", evidenceFile: "E4_T9_Matriks_TLHP_OPD.pdf", notes: "Perlu tambahan bukti penyetoran STS untuk OPD Dinas PU." },
];

export default function BpkpDashboardPage() {
  const [selectedTopic, setSelectedTopic] = useState(BPKP_TOPICS[0]);
  const [bpkpScore,     setBpkpScore]     = useState(selectedTopic.bpkpScore);
  const [validation,    setValidation]    = useState(selectedTopic.validation);
  const [notes,         setNotes]         = useState(selectedTopic.notes);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [savedSuccess,  setSavedSuccess]  = useState(false);

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setBpkpScore(topic.bpkpScore);
    setValidation(topic.validation);
    setNotes(topic.notes);
    setSavedSuccess(false);
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/bpkp/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId:          selectedTopic.id,
          bpkpScore:        parseInt(bpkpScore, 10),
          validationStatus: validation,
          bpkpNotes:        notes,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Workspace Evaluator BPKP (Assessor Desk)"
        subtitle="Evaluasi Keterpenuhan 5 Elemen / 19 Topik PK APIP Inspektorat Kab. Bolaang Mongondow"
      />

      <div className="flex flex-1 overflow-hidden bg-slate-100">

        {/* TOPICS SIDEBAR SELECTOR */}
        <div className="w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          <div className="border-b border-slate-100 p-4 bg-slate-50">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" /> Daftar Topik Evaluasi ({BPKP_TOPICS.length})
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Pilih topik untuk meninjau eviden & skor BPKP</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {BPKP_TOPICS.map((topic) => {
              const active = selectedTopic.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={cn(
                    "w-full p-4 text-left transition-all flex items-start gap-3",
                    active ? "bg-blue-50 border-l-4 border-blue-600" : "hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold",
                    active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                  )}>
                    {topic.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-xs font-bold truncate", active ? "text-blue-900" : "text-slate-800")}>
                      {topic.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{topic.elem}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Self: {topic.selfScore}</span>
                      <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">BPKP: {topic.bpkpScore}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SIDE-BY-SIDE EVALUATOR WORKSPACE */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT PANEL: Self-Assessment & Evidence PDF Viewer */}
          <div className="flex-1 overflow-y-auto p-6 bg-white border-r border-slate-200 space-y-6">

            {/* Read-Only Mode Banner */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Read-Only Assessor Mode:</strong> Evaluator BPKP tidak dapat menambah atau menghapus file eviden utama.
                </span>
              </div>
              <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold text-[10px]">ASSESSOR PERMISSION</span>
            </div>

            {/* Selected Topic Overview */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
                  TOPIK {selectedTopic.code} • {selectedTopic.elem}
                </span>
                <div className="flex gap-2 text-xs">
                  <span className="bg-slate-200 text-slate-800 px-2.5 py-1 rounded-full font-semibold">
                    Skor Mandiri APIP: <strong className="text-blue-600">{selectedTopic.selfScore} / 5</strong>
                  </span>
                </div>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{selectedTopic.name}</h2>
            </div>

            {/* Evidence PDF Viewer Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <FileSearch className="h-4 w-4 text-purple-600" /> Pratinjau Dokumen Eviden Utama
              </h3>

              {/* Simulated Embedded PDF Viewer Container */}
              <div className="rounded-2xl border border-slate-300 bg-slate-900 p-6 text-slate-100 flex flex-col items-center justify-center min-h-[380px] text-center relative overflow-hidden shadow-inner">
                <div className="absolute top-3 left-3 bg-slate-800/80 backdrop-blur border border-slate-700 text-xs px-3 py-1 rounded-lg text-slate-300 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span className="font-mono">{selectedTopic.evidenceFile}</span>
                </div>

                <div className="my-auto space-y-3 max-w-md">
                  <BookOpen className="mx-auto h-16 w-16 text-blue-400 opacity-80" />
                  <h4 className="text-base font-bold text-white">Dokumen Eviden Terverifikasi APIP</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Dokumen <code className="text-blue-300">{selectedTopic.evidenceFile}</code> telah disebarkan dalam repositori terenkripsi SIM-PK APIP.
                  </p>
                  <button
                    onClick={() => alert(`📄 Membuka viewer PDF dokumen: ${selectedTopic.evidenceFile}`)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-all shadow"
                  >
                    <Eye className="h-4 w-4" /> Buka Viewer Dokumen Penuh (PDF)
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: BPKP Score Input & Validation Checklist */}
          <div className="w-[420px] shrink-0 overflow-y-auto p-6 bg-slate-50 space-y-6">

            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-600" /> Form Evaluasi & Skor BPKP
              </h3>
              <p className="text-xs text-slate-500">Penilaian independen Evaluator Peraturan BPKP No 6/2025</p>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-5 text-xs">

              {/* BPKP Score Selector (1-5) */}
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                <label className="block font-bold text-slate-800">1. Skor Capaian BPKP (Skala 1 - 5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setBpkpScore(score)}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg font-bold transition-all text-sm border",
                        bpkpScore === score
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400"
                      )}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Evidence Validation Checklist */}
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                <label className="block font-bold text-slate-800">2. Validasi Keterpenuhan Eviden</label>
                <div className="space-y-2">
                  {[
                    { val: "MEMENUHI",     label: "✓ Memenuhi Bukti Lengkap", color: "text-green-700 bg-green-50 border-green-200" },
                    { val: "CUKUP",        label: "• Cukup (Perlu Tambahan Catatan)", color: "text-amber-700 bg-amber-50 border-amber-200" },
                    { val: "KURANG_BUKTI", label: "⚠ Kurang Bukti / Tidak Sesuai", color: "text-red-700 bg-red-50 border-red-200" },
                  ].map((v) => (
                    <label
                      key={v.val}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-all font-semibold",
                        validation === v.val ? v.color + " shadow-sm font-bold" : "border-slate-200 bg-slate-50 text-slate-600"
                      )}
                    >
                      <input
                        type="radio"
                        name="validationStatus"
                        value={v.val}
                        checked={validation === v.val}
                        onChange={() => setValidation(v.val)}
                        className="accent-blue-600"
                      />
                      <span>{v.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Evaluation Notes */}
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                <label className="block font-bold text-slate-800">3. Catatan Reviu & Saran BPKP</label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Berikan catatan evaluasi mengenai kualitas dan keterpenuhan eviden..."
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 leading-relaxed text-slate-800"
                />
              </div>

              {savedSuccess && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Skor & Catatan Evaluasi BPKP Berhasil Disimpan!
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Simpan Penilaian BPKP
              </button>
            </form>

          </div>

        </div>

      </div>
    </>
  );
}

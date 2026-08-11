"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewNoteSchema, qualityEvaluationSchema } from "@/lib/validations";
import { KKA_STATUS_CONFIG, formatRupiah, cn } from "@/lib/utils";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, FileText,
  Send, MessageSquare, Tag, Clock, UserCheck, Scale,
  Search, Zap, Lightbulb, FileCheck2, Loader2, ArrowLeft,
  Award, FileSpreadsheet, Eye
} from "lucide-react";
import Link from "next/link";

const SECTION_TAGS = [
  { value: "SEBAB",       label: "SEBAB / RCA", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "KONDISI",     label: "KONDISI",     color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "KRITERIA",    label: "KRITERIA",    color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "AKIBAT",      label: "AKIBAT",      color: "bg-red-100 text-red-800 border-red-200" },
  { value: "REKOMENDASI", label: "REKOMENDASI", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "EVIDEN",      label: "EVIDEN",      color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "UMUM",        label: "CATATAN UMUM",color: "bg-gray-100 text-gray-800 border-gray-200" },
];

export default function QAReviewWorkspace({ kka, engagement, userRole }) {
  const [activeTab,        setActiveTab]        = useState("review"); // "review" | "lhp" | "eval"
  const [reviews,          setReviews]          = useState(kka?.reviews || []);
  const [currentKKA,       setCurrentKKA]       = useState(kka);
  const [isRevisionModal,  setIsRevisionModal]  = useState(false);
  const [summaryNote,      setSummaryNote]      = useState("");
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [evalSubmitted,    setEvalSubmitted]    = useState(false);
  const [evalScore,        setEvalScore]        = useState(null);
  const [isLhpSubmitted,   setIsLhpSubmitted]   = useState(engagement?.status === "SUBMITTED_TO_IRBAN");

  // Review Note Form
  const { register: regNote, handleSubmit: handleNoteSubmit, reset: resetNoteForm, formState: { errors: noteErrors } } = useForm({
    resolver: zodResolver(reviewNoteSchema),
    defaultValues: { sectionTag: "SEBAB", note: "" },
  });

  // Quality Evaluation Form Sliders
  const [buktiScore, setBuktiScore] = useState(4);
  const [rcaScore,   setRcaScore]   = useState(4);
  const [rekomScore, setRekomScore] = useState(4);
  const totalQuality = Math.round(((buktiScore + rcaScore + rekomScore) / 15) * 100);

  // Submit new Correction Note
  const onAddNote = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/kka/${currentKKA.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newNote = await res.json();
        setReviews((prev) => [...prev, newNote]);
        resetNoteForm();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Note Status OPEN / RESOLVED
  const onToggleNoteStatus = async (noteId) => {
    setReviews((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isResolved: !n.isResolved, status: !n.isResolved ? "RESOLVED" : "OPEN" } : n))
    );
    await fetch(`/api/v1/kka/reviews/${noteId}/resolve`, { method: "PATCH" });
  };

  // Action: Request Revision
  const handleRequestRevision = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/kka/${currentKKA.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REVISION_REQUESTED",
          summaryNote,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentKKA(updated);
        setIsRevisionModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Approve KKA
  const handleApproveKKA = async () => {
    setIsSubmitting(true);
    const targetStatus = userRole === "IRBAN" ? "APPROVED_BY_DALNIS" : "APPROVED_BY_KETUA_TIM";
    try {
      const res = await fetch(`/api/v1/kka/${currentKKA.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentKKA(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Submit Quality Evaluation
  const handleQualitySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/assignments/${engagement?.id || "default"}/quality-evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buktiAuditScore:  buktiScore,
          rcaScore:         rcaScore,
          rekomendasiScore: rekomScore,
        }),
      });
      if (res.ok) {
        setEvalSubmitted(true);
        setEvalScore(totalQuality);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Submit LHP to Irban
  const handleSubmitLhpToIrban = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/review/dpp/${engagement?.id}/submit`, { method: "POST" });
      if (res.ok) {
        setIsLhpSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConf = KKA_STATUS_CONFIG[currentKKA?.status || "SUBMITTED"];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-100">

      {/* ── WORKSPACE HEADER ── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-4">
          <Link href="/auditor/dashboard" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 truncate max-w-md">
                QA Reviu: {engagement?.title || "Penugasan Audit Intern"}
              </h1>
              <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", statusConf?.color)}>
                {statusConf?.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Auditor: <span className="font-medium text-slate-700">{currentKKA?.createdBy?.fullName || "Auditor"}</span>
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("review")}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all",
                activeTab === "review" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> QA Reviu KKA
            </button>
            <button
              onClick={() => setActiveTab("lhp")}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all",
                activeTab === "lhp" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-amber-600" /> Draf LHP
            </button>
            <button
              onClick={() => setActiveTab("eval")}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all",
                activeTab === "eval" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Award className="h-3.5 w-3.5 text-purple-600" /> Evaluasi Mutu
            </button>
          </div>

          {/* Action Approval Buttons */}
          {activeTab === "review" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRevisionModal(true)}
                disabled={isSubmitting || currentKKA?.status === "REVISION_REQUESTED"}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2
                  text-xs font-semibold text-rose-700 transition-all hover:bg-rose-100 disabled:opacity-50"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Minta Revisi KKA
              </button>
              <button
                onClick={handleApproveKKA}
                disabled={isSubmitting || currentKKA?.status?.startsWith("APPROVED")}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2
                  text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Setujui KKA
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── TAB 1: SIDE-BY-SIDE QA REVIEW INTERFACE ── */}
      {activeTab === "review" && (
        <div className="flex flex-1 overflow-hidden">
          
          {/* LEFT PANEL: KKA Auditor Details */}
          <div className="flex-1 overflow-y-auto border-r border-slate-200 bg-white p-6 space-y-6">

            {/* Warning if Revision Requested */}
            {currentKKA?.status === "REVISION_REQUESTED" && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-600" /> KKA Sedang Diminta Revisi
                </p>
                {currentKKA?.summaryNote && (
                  <p className="mt-1 text-slate-700 bg-white/70 p-2 rounded border border-rose-200">
                    "{currentKKA.summaryNote}"
                  </p>
                )}
              </div>
            )}

            {/* 5 RCA Sections */}
            <div className="space-y-4">
              {/* Kondisi */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> 1. Kondisi (Fakta / Temuan)
                  </h3>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">TAG: KONDISI</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {currentKKA?.kondisi || "Belum ada deskripsi kondisi."}
                </p>
              </div>

              {/* Kriteria */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
                    <Scale className="h-4 w-4" /> 2. Kriteria (Regulasi / Ketentuan)
                  </h3>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono">TAG: KRITERIA</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {currentKKA?.kriteria || "Belum ada kriteria regulasi."}
                </p>
              </div>

              {/* Sebab / RCA */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
                    <Search className="h-4 w-4" /> 3. Sebab (Root Cause Analysis / 5 Whys)
                  </h3>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">TAG: SEBAB</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {currentKKA?.sebab || "Belum ada uraian akar masalah (RCA)."}
                </p>
              </div>

              {/* Akibat */}
              <div className="rounded-xl border border-red-200 bg-red-50/30 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> 4. Akibat (Dampak / Risiko)
                  </h3>
                  <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono">TAG: AKIBAT</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {currentKKA?.akibat || "Belum ada uraian akibat."}
                </p>
              </div>

              {/* Rekomendasi */}
              <div className="rounded-xl border border-green-200 bg-green-50/30 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-green-700 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" /> 5. Rekomendasi Perbaikan
                  </h3>
                  <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-mono">TAG: REKOMENDASI</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {currentKKA?.rekomendasi || "Belum ada rekomendasi."}
                </p>
              </div>

              {/* Nilai Kerugian */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Nilai Kerugian Daerah (Rp):</span>
                <span className="text-base font-bold text-slate-900">
                  Rp {formatRupiah(currentKKA?.nilaiKerugian || 0)}
                </span>
              </div>

              {/* Eviden Attachments */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-600 flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-purple-600" /> Lampiran Eviden ({currentKKA?.evidens?.length || 0})
                </h4>
                {currentKKA?.evidens?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada eviden di-upload.</p>
                ) : (
                  <ul className="space-y-1 text-xs">
                    {currentKKA?.evidens?.map((ev) => (
                      <li key={ev.id} className="flex items-center justify-between rounded bg-slate-50 p-2 border">
                        <span className="font-mono text-slate-700 truncate">{ev.fileName}</span>
                        <span className="text-slate-400 shrink-0 ml-2">({ev.fileSize})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Correction Notes Thread */}
          <div className="w-[420px] flex flex-col border-l border-slate-200 bg-white overflow-hidden">
            
            {/* Right Panel Header */}
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" /> Catatan Koreksi Tim QA
              </h3>
              <p className="text-xs text-slate-500">Berikan koreksi spesifik per bagian KKA</p>
            </div>

            {/* Correction Notes Thread List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {reviews.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  <p className="text-xs font-medium">Belum ada catatan koreksi</p>
                  <p className="text-[11px] text-slate-400">Tambahkan catatan di form di bawah</p>
                </div>
              ) : (
                reviews.map((item) => {
                  const tagInfo = SECTION_TAGS.find((t) => t.value === item.sectionTag) || SECTION_TAGS[6];
                  const isResolved = item.isResolved || item.status === "RESOLVED";
                  return (
                    <div key={item.id} className={cn(
                      "rounded-lg border p-3 text-xs transition-all",
                      isResolved ? "bg-green-50/50 border-green-200" : "bg-white border-slate-200 shadow-sm"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn("rounded border px-2 py-0.5 font-bold text-[10px]", tagInfo.color)}>
                          {tagInfo.label}
                        </span>
                        <button
                          onClick={() => onToggleNoteStatus(item.id)}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all border",
                            isResolved
                              ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                              : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                          )}
                        >
                          {isResolved ? "✓ RESOLVED" : "• OPEN"}
                        </button>
                      </div>
                      <p className={cn("text-slate-800 leading-relaxed whitespace-pre-wrap", isResolved && "line-through opacity-70")}>
                        {item.note}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t pt-1.5">
                        <span>Oleh: {item.reviewer?.fullName || "Ketua Tim"}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleNoteSubmit(onAddNote)} className="border-t border-slate-200 bg-slate-50 p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Tag className="h-3 w-3 text-slate-500" /> Tag Bagian KKA
                </label>
                <select
                  {...regNote("sectionTag")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium outline-none focus:border-blue-500"
                >
                  {SECTION_TAGS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <textarea
                  {...regNote("note")}
                  rows={3}
                  placeholder="Tulis catatan koreksi spesifik..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
                {noteErrors.note && <p className="text-[11px] text-red-600 mt-0.5">{noteErrors.note.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Kirim Catatan Koreksi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 2: DRAF LHP COMPILER & PREVIEW ── */}
      {activeTab === "lhp" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Dokumen Draf LHP</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Laporan Hasil Pengawasan: {engagement?.title || "Penugasan Audit Intern"}
                </h2>
                <p className="text-xs text-slate-500">Inspektorat Daerah Kabupaten Bolaang Mongondow</p>
              </div>
              <button
                onClick={handleSubmitLhpToIrban}
                disabled={isLhpSubmitted || isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60 transition-all"
              >
                {isLhpSubmitted ? (
                  <>✓ Sudah Diteruskan ke Irban</>
                ) : (
                  <>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit Draf LHP ke Irban
                  </>
                )}
              </button>
            </div>

            {/* Aggregated Approved KKA Items */}
            <div className="space-y-6 text-sm text-slate-800 leading-relaxed">
              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 border-b pb-1">I. BAB I: RINGKASAN EKSEKUTIF</h3>
                <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border">
                  Berdasarkan hasil pengawasan intern pada {engagement?.title || "opd terkait"}, ditemukan indikasi kerugian daerah sebesar <span className="font-bold text-slate-900">Rp {formatRupiah(currentKKA?.nilaiKerugian || 0)}</span> dengan rincian temuan sebagai berikut.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-slate-900 border-b pb-1">II. BAB II: URAIAN HASIL PEMERIKSAAN (RCA)</h3>
                
                <div className="space-y-3 pl-4 border-l-2 border-blue-500">
                  <div>
                    <h4 className="font-semibold text-blue-900 text-xs uppercase">A. Kondisi:</h4>
                    <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded mt-1">{currentKKA?.kondisi || "—"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-900 text-xs uppercase">B. Kriteria:</h4>
                    <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded mt-1">{currentKKA?.kriteria || "—"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-xs uppercase">C. Sebab (Akar Masalah):</h4>
                    <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded mt-1">{currentKKA?.sebab || "—"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900 text-xs uppercase">D. Akibat:</h4>
                    <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded mt-1">{currentKKA?.akibat || "—"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 text-xs uppercase">E. Rekomendasi:</h4>
                    <p className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded mt-1">{currentKKA?.rekomendasi || "—"}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: EVALUASI MUTU PENUGASAN (1-5 Sliders) ── */}
      {activeTab === "eval" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" /> Form Evaluasi Mutu KKA & Penugasan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Berikan penilaian mutu (skala 1-5) untuk menentukan Total Quality Score secara otomatis.
              </p>
            </div>

            <form onSubmit={handleQualitySubmit} className="space-y-6">
              {/* Slider 1: Bukti Audit */}
              <div className="space-y-2 border-b pb-4">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-800">1. Ketersediaan & Validitas Bukti Audit</label>
                  <span className="font-bold text-blue-600 text-sm">{buktiScore} / 5</span>
                </div>
                <input
                  type="range" min="1" max="5" value={buktiScore}
                  onChange={(e) => setBuktiScore(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 (Kurang Bukti)</span>
                  <span>3 (Cukup)</span>
                  <span>5 (Sangat Lengkap & Valid)</span>
                </div>
              </div>

              {/* Slider 2: RCA */}
              <div className="space-y-2 border-b pb-4">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-800">2. Kedalaman Root Cause Analysis (Sebab / 5 Whys)</label>
                  <span className="font-bold text-amber-600 text-sm">{rcaScore} / 5</span>
                </div>
                <input
                  type="range" min="1" max="5" value={rcaScore}
                  onChange={(e) => setRcaScore(parseInt(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 (Dangkal)</span>
                  <span>3 (Sedang)</span>
                  <span>5 (Sangat Mendalam)</span>
                </div>
              </div>

              {/* Slider 3: Rekomendasi */}
              <div className="space-y-2 border-b pb-4">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-800">3. Kualitas & Tindak Lanjut Rekomendasi</label>
                  <span className="font-bold text-green-600 text-sm">{rekomScore} / 5</span>
                </div>
                <input
                  type="range" min="1" max="5" value={rekomScore}
                  onChange={(e) => setRekomScore(parseInt(e.target.value))}
                  className="w-full accent-green-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 (Umum/Tidak Operasional)</span>
                  <span>3 (Operasional)</span>
                  <span>5 (Sangat Aksionabel)</span>
                </div>
              </div>

              {/* Calculated Total Quality Score */}
              <div className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-white flex items-center justify-between shadow-md">
                <div>
                  <p className="text-xs text-purple-200">Automated Total Quality Score</p>
                  <h3 className="text-2xl font-black mt-0.5">{totalQuality}%</h3>
                </div>
                <span className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold bg-white/20 border border-white/30 text-white"
                )}>
                  {totalQuality >= 80 ? "SANGAT BAIK" : totalQuality >= 60 ? "BAIK" : "PERLU PERBAIKAN"}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || evalSubmitted}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 py-3 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-60 transition-all shadow"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                {evalSubmitted ? "✓ Evaluasi Mutu Tersimpan" : "Simpan Evaluasi Mutu"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: MINTA REVISI KKA ── */}
      {isRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Minta Revisi KKA</h3>
                <p className="text-xs text-slate-500">Kirim catatan ringkas mengenai poin yang harus diperbaiki</p>
              </div>
            </div>

            <textarea
              value={summaryNote}
              onChange={(e) => setSummaryNote(e.target.value)}
              rows={4}
              placeholder="Jelaskan ringkasan revisi yang harus dikerjakan auditor..."
              className="w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRevisionModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Kirim Permintaan Revisi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import {
  FileText, ShieldCheck, CheckCircle2, AlertTriangle, Send,
  UserCheck, Plus, ListChecks, FileSpreadsheet, MessageSquare,
  ChevronRight, Sparkles, Loader2, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_PKA = [
  { id: "pka-1", procedure: "Pengujian fisik sampel proyek pembangunan gedung laboratorium", auditor: "Auditor Pertama (Ahmad Dahlan)", status: "COMPLETED" },
  { id: "pka-2", procedure: "Konfirmasi kebenaran penyetoran pajak ke Kas Negara", auditor: "Auditor Muda (Siti Rahmawati)", status: "IN_PROGRESS" },
  { id: "pka-3", procedure: "Reviu keabsahan bukti kwitansi dan pertanggungjawaban BOK", auditor: "Auditor Pertama (Nita Pratama)", status: "PLANNED" },
];

const SUBMITTED_KKAS = [
  { id: "kka-101", code: "KKA-01", title: "Kelebihan Pembayaran Belanja Modal Gedung PU", auditor: "Ahmad Dahlan", nilaiKerugian: "45000000", status: "SUBMITTED_TO_KT" },
  { id: "kka-102", code: "KKA-02", title: "Ketidaksesuaian Pembayaran Honorarium Penyuluhan", auditor: "Siti Rahmawati", nilaiKerugian: "12500000", status: "APPROVED_BY_KT" },
];

export default function KetuaTimWorkspacePage() {
  const [activeTab,    setActiveTab]    = useState("review"); // "pka" | "review" | "lhp"
  const [pkaList,      setPkaList]      = useState(INITIAL_PKA);
  const [kkaList,      setKkaList]      = useState(SUBMITTED_KKAS);
  const [selectedKka,  setSelectedKka]  = useState(SUBMITTED_KKAS[0]);
  const [noteTag,      setNoteTag]      = useState("SEBAB");
  const [noteText,     setNoteText]     = useState("");
  const [notesList,    setNotesList]    = useState([]);
  const [newPkaProc,   setNewPkaProc]   = useState("");
  const [newPkaAud,    setNewPkaAud]    = useState("Ahmad Dahlan");
  const [isGenerated,  setIsGenerated]  = useState(false);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNotesList((prev) => [...prev, { id: Date.now().toString(), tag: noteTag, text: noteText, reviewer: "Ketua Tim" }]);
    setNoteText("");
  };

  const handleApproveKka = (id) => {
    setKkaList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "APPROVED_BY_KT" } : k))
    );
    setSelectedKka((prev) => ({ ...prev, status: "APPROVED_BY_KT" }));
  };

  const handleRequestRevision = (id) => {
    setKkaList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "REVISION_REQUESTED" } : k))
    );
    setSelectedKka((prev) => ({ ...prev, status: "REVISION_REQUESTED" }));
  };

  const handleAddPka = (e) => {
    e.preventDefault();
    if (!newPkaProc.trim()) return;
    setPkaList((prev) => [
      ...prev,
      { id: `pka-${Date.now()}`, procedure: newPkaProc, auditor: newPkaAud, status: "PLANNED" },
    ]);
    setNewPkaProc("");
  };

  return (
    <>
      <Header
        title="Workspace Ketua Tim (Level 1 QA Reviewer)"
        subtitle="Manajemen PKA Penugasan, Reviu Berjenjang KKA, & Auto-Generator Draf LHP"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Tab Switcher & Generator */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm">
            <button
              onClick={() => setActiveTab("pka")}
              className={cn("flex items-center gap-2 rounded-lg px-4 py-2 transition-all",
                activeTab === "pka" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <ListChecks className="h-4 w-4" /> DPP & Program Kerja Audit (PKA)
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={cn("flex items-center gap-2 rounded-lg px-4 py-2 transition-all",
                activeTab === "review" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <ShieldCheck className="h-4 w-4" /> Reviu Level 1 KKA ({kkaList.filter((k)=>k.status==='SUBMITTED_TO_KT').length})
            </button>
            <button
              onClick={() => setActiveTab("lhp")}
              className={cn("flex items-center gap-2 rounded-lg px-4 py-2 transition-all",
                activeTab === "lhp" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <FileSpreadsheet className="h-4 w-4" /> Auto-Draf LHP Compiler
            </button>
          </div>

          {activeTab === "lhp" && (
            <button
              onClick={() => setIsGenerated(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow"
            >
              <Sparkles className="h-4 w-4 text-emerald-200" /> Auto-Generate Draf LHP dari KKA Approved
            </button>
          )}
        </div>

        {/* ── TAB 1: PKA MANAGEMENT ── */}
        {activeTab === "pka" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-3">Tambah Prosedur Audit (PKA) Baru</h3>
              
              <form onSubmit={handleAddPka} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <input
                  type="text" placeholder="Uraian prosedur pengujian audit..."
                  value={newPkaProc} onChange={(e) => setNewPkaProc(e.target.value)}
                  className="sm:col-span-2 rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                />
                <select
                  value={newPkaAud} onChange={(e) => setNewPkaAud(e.target.value)}
                  className="rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Ahmad Dahlan">Ahmad Dahlan (Auditor Pertama)</option>
                  <option value="Siti Rahmawati">Siti Rahmawati (Auditor Muda)</option>
                  <option value="Nita Pratama">Nita Pratama (Auditor Pertama)</option>
                </select>
                <button type="submit" className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-700 shadow">
                  <Plus className="h-4 w-4" /> Tambah PKA
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 p-4 bg-slate-50">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Matriks Prosedur PKA Penugasan</h3>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b">
                  <tr>
                    <th className="px-6 py-3.5">Prosedur Pengujian</th>
                    <th className="px-6 py-3.5">Auditor Penanggung Jawab</th>
                    <th className="px-6 py-3.5">Status PKA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pkaList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{p.procedure}</td>
                      <td className="px-6 py-4 text-slate-700">{p.auditor}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "rounded-full px-2.5 py-0.5 font-bold text-[11px]",
                          p.status === "COMPLETED" && "bg-green-100 text-green-800",
                          p.status === "IN_PROGRESS" && "bg-amber-100 text-amber-800",
                          p.status === "PLANNED" && "bg-slate-100 text-slate-600"
                        )}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: LEVEL 1 KKA REVIEWER (INLINE NOTES) ── */}
        {activeTab === "review" && (
          <div className="flex gap-6 h-[calc(100vh-220px)] overflow-hidden">

            {/* Submitted KKAs Sidebar */}
            <div className="w-80 shrink-0 border border-slate-200 bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm">
              <div className="border-b border-slate-100 p-4 bg-slate-50">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">KKA Masuk Dari Auditor</h3>
              </div>
              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                {kkaList.map((kka) => (
                  <button
                    key={kka.id}
                    onClick={() => setSelectedKka(kka)}
                    className={cn(
                      "w-full p-4 text-left transition-all",
                      selectedKka.id === kka.id ? "bg-blue-50 border-l-4 border-blue-600" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-blue-700">{kka.code}</span>
                      <span className={cn("rounded px-2 py-0.5 font-bold text-[10px]",
                        kka.status === "APPROVED_BY_KT" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      )}>
                        {kka.status}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs truncate">{kka.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Oleh: {kka.auditor}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* KKA Content & Inline Reviewer Panel */}
            <div className="flex-1 border border-slate-200 bg-white rounded-2xl p-6 shadow-sm overflow-y-auto space-y-6">
              
              {/* Header Action Buttons */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <span className="text-xs font-bold font-mono text-blue-600">{selectedKka.code}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedKka.title}</h3>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequestRevision(selectedKka.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" /> Minta Revisi
                  </button>
                  <button
                    onClick={() => handleApproveKka(selectedKka.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Setujui KKA (Level 1)
                  </button>
                </div>
              </div>

              {/* Inline Correction Note Input */}
              <form onSubmit={handleAddNote} className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3 text-xs">
                <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-blue-600" /> Tambah Catatan Koreksi Inline (Ketua Tim)
                </h4>
                <div className="flex gap-2">
                  <select
                    value={noteTag} onChange={(e) => setNoteTag(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold outline-none bg-white"
                  >
                    <option value="SEBAB">SEBAB / RCA</option>
                    <option value="KONDISI">KONDISI</option>
                    <option value="KRITERIA">KRITERIA</option>
                    <option value="AKIBAT">AKIBAT</option>
                    <option value="REKOMENDASI">REKOMENDASI</option>
                  </select>
                  <input
                    type="text" placeholder="Tulis catatan revisi spesifik tanpa mengubah teks asli auditor..."
                    value={noteText} onChange={(e) => setNoteText(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none bg-white"
                  />
                  <button type="submit" className="rounded-lg bg-blue-600 px-4 py-1.5 font-bold text-white hover:bg-blue-700">
                    Kirim Catatan
                  </button>
                </div>
              </form>

              {/* Display Added Notes */}
              {notesList.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-700">Catatan Koreksi Terkirim:</h4>
                  {notesList.map((n) => (
                    <div key={n.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      <span className="font-bold bg-amber-200 px-1.5 py-0.5 rounded mr-2 text-[10px]">TAG: {n.tag}</span>
                      "{n.text}"
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* ── TAB 3: DRAF LHP AUTO-GENERATOR ── */}
        {activeTab === "lhp" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
            <div className="border-b pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Agregator Draf LHP Penugasan</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Draf Laporan Hasil Pengawasan (LHP)</h2>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
                Auto-Compiled
              </span>
            </div>

            <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
              <p className="bg-slate-50 p-4 rounded-xl border">
                Dokumen ini merupakan hasil kompilasi otomatis dari seluruh KKA yang telah disetujui oleh Ketua Tim (`APPROVED_BY_KT`).
              </p>

              <div className="rounded-xl border p-4 bg-slate-50 space-y-2">
                <h4 className="font-bold text-slate-900">Uraian Temuan & Rekomendasi Aggregated:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Temuan 1: Kelebihan Pembayaran Belanja Modal Gedung PU — Rp 45.000.000</li>
                  <li>Temuan 2: Honorarium Penyuluhan Kesehatan Ganda — Rp 12.500.000</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

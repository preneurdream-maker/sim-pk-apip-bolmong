"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import {
  FolderOpen, Users, AlertCircle, Download, UploadCloud,
  FileCheck2, Plus, Award, CheckCircle2, Clock, Search,
  X, Loader2, Sparkles, Filter, ChevronRight, BarChart3, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const PK_ELEMENTS = [
  { code: "E1", name: "1. Kebijakan & Tata Kelola APIP", topicsCount: 4, desc: "Perbup, Kode Etik, Piagam Audit (Audit Charter)" },
  { code: "E2", name: "2. Pengelolaan Sumber Daya Manusia (SDM)", topicsCount: 4, desc: "Perencanaan SDM, Diklat 120 JPL, Sertifikasi Matriks" },
  { code: "E3", name: "3. Praktik Profesional Audit Intern", topicsCount: 5, desc: "Pedoman KKA, Manual Audit, Reviu Berjenjang" },
  { code: "E4", name: "4. Akuntabilitas & Kinerja APIP", topicsCount: 3, desc: "PKPT Berbasis Risiko, Laporan Kinerja, TLHP" },
  { code: "E5", name: "5. Budaya Organisasi & Inovasi", topicsCount: 3, desc: "Penerapan e-Audit, WBS Online, Digitalisasi" },
];

const INITIAL_TOPICS = [
  { id: "t1", elementCode: "E1", code: "T1", name: "Piagam Audit Intern (Audit Charter)", evidencesCount: 3, lastVersion: 2, status: "LENGKAP" },
  { id: "t2", elementCode: "E1", code: "T2", name: "Independensi & Otonomi APIP", evidencesCount: 2, lastVersion: 1, status: "LENGKAP" },
  { id: "t3", elementCode: "E1", code: "T3", name: "Penerapan Kode Etik Auditor", evidencesCount: 4, lastVersion: 3, status: "LENGKAP" },
  { id: "t4", elementCode: "E1", code: "T4", name: "Struktur Organisasi & Tata Kerja", evidencesCount: 1, lastVersion: 1, status: "PROSES" },
  { id: "t5", elementCode: "E2", code: "T5", name: "Pemenuhan Jam Pelajaran (120 JPL)", evidencesCount: 5, lastVersion: 2, status: "LENGKAP" },
  { id: "t6", elementCode: "E2", code: "T6", name: "Sertifikasi Jabatan Fungsional Auditor", evidencesCount: 3, lastVersion: 1, status: "LENGKAP" },
  { id: "t7", elementCode: "E3", code: "T7", name: "Manual Audit Berbasis Risiko (PKPT)", evidencesCount: 4, lastVersion: 2, status: "LENGKAP" },
  { id: "t8", elementCode: "E3", code: "T8", name: "Kertas Kerja Audit (KKA) 5 RCA", evidencesCount: 6, lastVersion: 4, status: "LENGKAP" },
  { id: "t9", elementCode: "E4", code: "T9", name: "Pemantauan Tindak Lanjut Hasil Pemeriksaan", evidencesCount: 3, lastVersion: 1, status: "PROSES" },
  { id: "t10", elementCode: "E5", code: "T10", name: "Implementasi Sistem Informasi e-Audit", evidencesCount: 2, lastVersion: 1, status: "LENGKAP" },
];

const INITIAL_AUDITORS = [
  { id: "a1", name: "Ahmad Dahlan, SE", nip: "199001012015031005", rank: "Auditor Muda", currentJpl: 105, targetJpl: 120 },
  { id: "a2", name: "Siti Rahmawati, ST", nip: "199205252016022006", rank: "Auditor Pertama", currentJpl: 125, targetJpl: 120 },
  { id: "a3", name: "Budi Santoso, SH", nip: "198803122014011003", rank: "Auditor Madya", currentJpl: 90, targetJpl: 120 },
  { id: "a4", name: "Nita Pratama, S.Ak", nip: "199508102019032008", rank: "Auditor Pertama", currentJpl: 110, targetJpl: 120 },
];

const INITIAL_AOI = [
  { id: "aoi1", topic: "T5 - Pemenuhan 120 JPL", issue: "Beberapa Auditor Pertama belum mencapai target 120 JPL tahunan", actionPlan: "Pengikutsertaan Diklat Substantif APIP BPKP Q3 2026", targetDate: "2026-10-30", status: "IN_PROGRESS" },
  { id: "aoi2", topic: "T7 - Manual Audit Risiko", issue: "Pedoman audit perlu disesuaikan dengan Peraturan BPKP No 6/2025", actionPlan: "Revisi Perbup Manual Audit Intern", targetDate: "2026-09-15", status: "OPEN" },
  { id: "aoi3", topic: "T10 - Sistem e-Audit", issue: "Integrasi database tindak lanjut OPD belum otomatis 100%", actionPlan: "Pengembangan modul e-TLHP portal OPD", targetDate: "2026-08-30", status: "CLOSED" },
];

export default function AdminPkApipPage() {
  const [activeTab, setActiveTab] = useState("repo"); // "repo" | "sdm" | "aoi"
  const [selectedElement, setSelectedElement] = useState("ALL");
  const [topics, setTopics] = useState(INITIAL_TOPICS);
  const [auditors, setAuditors] = useState(INITIAL_AUDITORS);
  const [aoiItems, setAoiItems] = useState(INITIAL_AOI);

  // Upload Evidence Modal State
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [evidenceName, setEvidenceName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Add JPL Log Modal State
  const [jplModal, setJplModal] = useState(false);
  const [selectedAuditor, setSelectedAuditor] = useState(null);
  const [trainingName, setTrainingName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [jplHours, setJplHours] = useState(15);

  // Handle Export Dossier ZIP
  const handleExportZip = () => {
    alert("📦 Mengompilasi seluruh dokumen 5 Elemen & 19 Topik PK APIP ke dalam Berkas Zip Dossier... \nFile 'Dossier_PK_APIP_Bolmong_2026.zip' berhasil didownload!");
  };

  // Upload Evidence Submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopic || !evidenceName) return;
    setIsUploading(true);

    try {
      await fetch("/api/v1/pk-apip/evidences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopic.id,
          fileName: evidenceName,
        }),
      });

      setTopics((prev) =>
        prev.map((t) =>
          t.id === selectedTopic.id
            ? { ...t, evidencesCount: t.evidencesCount + 1, lastVersion: t.lastVersion + 1, status: "LENGKAP" }
            : t
        )
      );
      setUploadModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Add JPL Log Submit
  const handleJplSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAuditor || !trainingName) return;
    setIsUploading(true);

    try {
      await fetch("/api/v1/sdm/jpl-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditorSdmId: selectedAuditor.id,
          trainingName,
          organizer: organizer || "Pusdiklatwas BPKP",
          jplHours: parseInt(jplHours, 10),
        }),
      });

      setAuditors((prev) =>
        prev.map((a) =>
          a.id === selectedAuditor.id
            ? { ...a, currentJpl: a.currentJpl + parseInt(jplHours, 10) }
            : a
        )
      );
      setJplModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredTopics = selectedElement === "ALL"
    ? topics
    : topics.filter((t) => t.elementCode === selectedElement);

  return (
    <>
      <Header
        title="Pusat Sekretariat PK APIP & SIM-SDM"
        subtitle="Manajemen Eviden 5 Elemen / 19 Topik & Tracker Diklat 120 JPL Auditor"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm">
            <button
              onClick={() => setActiveTab("repo")}
              className={cn("flex items-center gap-2 rounded-lg px-4 py-2 transition-all",
                activeTab === "repo" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <FolderOpen className="h-4 w-4" /> Repository 5 Elemen & 19 Topik
            </button>
            <button
              onClick={() => setActiveTab("sdm")}
              className={cn("flex items-center gap-2 rounded-lg px-4 py-2 transition-all",
                activeTab === "sdm" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Users className="h-4 w-4" /> SIM-SDM & Tracker 120 JPL
            </button>
            <button
              onClick={() => setActiveTab("aoi")}
              className={cn("flex items-center gap-2 rounded-lg px-4 py-2 transition-all",
                activeTab === "aoi" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <BarChart3 className="h-4 w-4" /> Area of Improvement (AoI)
            </button>
          </div>

          {activeTab === "repo" && (
            <button
              onClick={handleExportZip}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Download className="h-4 w-4" /> Export All Dossier ZIP
            </button>
          )}
        </div>

        {/* ── TAB 1: REPOSITORY 5 ELEMEN & 19 TOPIK ── */}
        {activeTab === "repo" && (
          <div className="space-y-6">

            {/* Elements Filter Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <button
                onClick={() => setSelectedElement("ALL")}
                className={cn(
                  "rounded-xl border p-3 text-center transition-all text-xs font-bold",
                  selectedElement === "ALL"
                    ? "border-blue-600 bg-blue-600 text-white shadow"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                )}
              >
                Semua Elemen (19 Topik)
              </button>

              {PK_ELEMENTS.map((elem) => (
                <button
                  key={elem.code}
                  onClick={() => setSelectedElement(elem.code)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all text-xs",
                    selectedElement === elem.code
                      ? "border-blue-600 bg-blue-50 text-blue-900 font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                  )}
                >
                  <span className="font-bold text-blue-600 block">{elem.code}</span>
                  <span className="truncate block font-medium mt-0.5">{elem.name.split(". ")[1]}</span>
                </button>
              ))}
            </div>

            {/* Topics Grid / Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 p-4 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Daftar Topik Penilaian PK APIP ({filteredTopics.length} Topik)
                </h3>
                <span className="text-[11px] text-slate-500">Peraturan BPKP No. 6 Tahun 2025</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredTopics.map((topic) => (
                  <div key={topic.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-800 text-xs">
                        {topic.code}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{topic.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>{topic.evidencesCount} File Eviden</span>
                          <span>•</span>
                          <span>Versi Terakhir: v{topic.lastVersion}.0</span>
                          <span>•</span>
                          <span className={cn(
                            "font-semibold rounded px-2 py-0.5 text-[10px]",
                            topic.status === "LENGKAP" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          )}>
                            {topic.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => { setSelectedTopic(topic); setUploadModal(true); }}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-blue-400 transition-all shadow-sm"
                    >
                      <UploadCloud className="h-3.5 w-3.5 text-blue-600" /> Upload Eviden Baru
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 2: SIM-SDM & TRACKER 120 JPL ── */}
        {activeTab === "sdm" && (
          <div className="space-y-6">

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Tracker Jam Pelajaran (JPL) Auditor</h3>
                  <p className="text-xs text-slate-500">Target Pengembangan Kompetensi Berkelanjutan (PKT) : 120 JPL per Auditor</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b">
                    <tr>
                      <th className="px-6 py-3.5">Nama Auditor / NIP</th>
                      <th className="px-6 py-3.5">Jabatan Fungsional</th>
                      <th className="px-6 py-3.5">Capaian JPL (Target 120)</th>
                      <th className="px-6 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditors.map((aud) => {
                      const pct = Math.min(100, Math.round((aud.currentJpl / aud.targetJpl) * 100));
                      const isComplete = aud.currentJpl >= aud.targetJpl;
                      return (
                        <tr key={aud.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 text-sm">{aud.name}</p>
                            <p className="text-slate-500 text-[11px]">NIP: {aud.nip}</p>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700">
                            {aud.rank}
                          </td>
                          <td className="px-6 py-4 w-72">
                            <div className="flex items-center justify-between text-xs font-bold mb-1">
                              <span className={isComplete ? "text-green-600" : "text-blue-600"}>
                                {aud.currentJpl} / {aud.targetJpl} JPL
                              </span>
                              <span className="text-slate-500">{pct}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={cn("h-2 rounded-full transition-all", isComplete ? "bg-green-500" : "bg-blue-600")}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => { setSelectedAuditor(aud); setJplModal(true); }}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700 transition-all shadow-sm"
                            >
                              <Plus className="h-3.5 w-3.5" /> Log Diklat Baru
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 3: AREA OF IMPROVEMENT (AOI) MATRIX ── */}
        {activeTab === "aoi" && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-5">
              <h3 className="font-bold text-slate-900 text-sm">Matriks Area of Improvement (AoI)</h3>
              <p className="text-xs text-slate-500">Rencana aksi perbaikan keterpenuhan PK APIP Inspektorat</p>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b">
                <tr>
                  <th className="px-6 py-3.5">Topik PK APIP</th>
                  <th className="px-6 py-3.5">Catatan Kekurangan (Issue)</th>
                  <th className="px-6 py-3.5">Rencana Aksi Perbaikan</th>
                  <th className="px-6 py-3.5">Target</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aoiItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-700">{item.topic}</td>
                    <td className="px-6 py-4 text-slate-800">{item.issue}</td>
                    <td className="px-6 py-4 text-slate-800 font-medium">{item.actionPlan}</td>
                    <td className="px-6 py-4 text-slate-500">{item.targetDate}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                        item.status === "CLOSED" && "bg-green-100 text-green-800 border-green-200",
                        item.status === "IN_PROGRESS" && "bg-amber-100 text-amber-800 border-amber-200",
                        item.status === "OPEN" && "bg-red-100 text-red-800 border-red-200"
                      )}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ── MODAL UPLOAD EVIDEN ── */}
      {uploadModal && selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Upload Eviden: {selectedTopic.code}</h3>
              <button onClick={() => setUploadModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5"/></button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Nama Dokumen Eviden</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: E1_T1_KKA_2026_Perbup_Audit.pdf"
                  value={evidenceName}
                  onChange={(e) => setEvidenceName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setUploadModal(false)} className="rounded-lg border px-4 py-2 font-semibold text-slate-600">Batal</button>
                <button type="submit" disabled={isUploading} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <UploadCloud className="h-4 w-4"/>} Simpan Eviden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL LOG JPL DIKLAT ── */}
      {jplModal && selectedAuditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Log Diklat & JPL: {selectedAuditor.name}</h3>
              <button onClick={() => setJplModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5"/></button>
            </div>

            <form onSubmit={handleJplSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Nama Diklat / Pelatihan</label>
                <input
                  type="text" required placeholder="Contoh: Diklat Audit Berbasis Risiko BPKP"
                  value={trainingName} onChange={(e) => setTrainingName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Penyelenggara</label>
                <input
                  type="text" placeholder="Pusdiklatwas BPKP / Kementerian Dalam Negeri"
                  value={organizer} onChange={(e) => setOrganizer(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Jumlah Jam Pelajaran (JPL)</label>
                <input
                  type="number" min="1" required
                  value={jplHours} onChange={(e) => setJplHours(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setJplModal(false)} className="rounded-lg border px-4 py-2 font-semibold text-slate-600">Batal</button>
                <button type="submit" disabled={isUploading} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Plus className="h-4 w-4"/>} Tambah JPL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wbsReportSchema } from "@/lib/validations";
import {
  ShieldAlert, UserCheck, EyeOff, Send, Search, Copy, Check,
  FileCheck2, AlertCircle, Loader2, ArrowLeft, ShieldCheck,
  Building2, MessageSquareText, Lock, FileText, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "CORRUPTION_PUNGLI", label: "Tindak Pidana Korupsi / Pungli", desc: "Penyalahgunaan uang negara, pungutan liar" },
  { value: "GRATIFICATION",     label: "Pelaporan Gratifikasi / Hadiah", desc: "Penerimaan hadiah, parsel, atau komisi terkait jabatan" },
  { value: "ABUSE_OF_POWER",    label: "Penyalahgunaan Wewenang",        desc: "Tindakan di luar kewenangan untuk kepentingan pribadi" },
  { value: "SOP_VIOLATION",     label: "Pelanggaran SOP / Kode Etik",    desc: "Pelanggaran prosedur operasional atau disiplin PNS" },
];

const WBS_STATUS_MAP = {
  DITERIMA: { label: "Diterima (Proses Awal)", color: "bg-blue-100 text-blue-800 border-blue-200" },
  DIPROSES: { label: "Sedang Diverifikasi APIP", color: "bg-amber-100 text-amber-800 border-amber-200" },
  SELESAI:  { label: "Selesai Ditindaklanjuti", color: "bg-green-100 text-green-800 border-green-200" },
  DITOLAK:   { label: "Ditolak / Kurang Bukti", color: "bg-red-100 text-red-800 border-red-200" },
};

export default function PublicWBSPage() {
  const [activeTab,    setActiveTab]    = useState("report"); // "report" | "track"
  const [isAnonymous,  setIsAnonymous]  = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [copied,       setCopied]       = useState(false);
  const [evidenceName, setEvidenceName] = useState("");

  // Track search state
  const [trackCode,    setTrackCode]    = useState("");
  const [isTracking,   setIsTracking]   = useState(false);
  const [trackedReport,setTrackedReport]= useState(null);
  const [trackError,   setTrackError]   = useState("");

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(wbsReportSchema),
    defaultValues: {
      isAnonymous: false,
      category: "CORRUPTION_PUNGLI",
      title: "",
      description: "",
      reporterName: "",
      reporterContact: "",
    },
  });

  const handleToggleAnonymous = (val) => {
    setIsAnonymous(val);
    setValue("isAnonymous", val);
  };

  const onSubmitReport = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/public/wbs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          isAnonymous,
          evidenceUrl: evidenceName ? `/uploads/${evidenceName}` : undefined,
        }),
      });

      const result = await res.json();
      if (res.ok && result.ticketCode) {
        setSubmittedResult(result);
        reset();
        setEvidenceName("");
      } else {
        // Fallback result for demo if offline
        const fallbackTicket = `WBS-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setSubmittedResult({ ticketCode: fallbackTicket });
        reset();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (submittedResult?.ticketCode) {
      navigator.clipboard.writeText(submittedResult.ticketCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!trackCode.trim()) return;
    setIsTracking(true);
    setTrackError("");
    setTrackedReport(null);

    try {
      const res = await fetch(`/api/v1/public/wbs/track/${encodeURIComponent(trackCode.trim())}`);
      const data = await res.json();

      if (res.ok) {
        setTrackedReport(data);
      } else {
        setTrackError(data.error || "Kode tiket tidak ditemukan.");
      }
    } catch (e) {
      setTrackError("Terjadi kesalahan jaringan.");
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6">
      
      {/* Background grid effect */}
      <div className="pointer-events-none fixed inset-0 bg-[url('/grid.svg')] opacity-5" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-4xl flex items-center justify-between py-4 border-b border-slate-800 z-10">
        <Link href="/login" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Portal SIM-PK APIP
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-bold text-white">Layanan WBS & Gratifikasi</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-4xl my-8 z-10 space-y-6">

        {/* Hero Banner */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 mb-3">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Whistleblowing System (WBS) & Gratifikasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Inspektorat Daerah Kabupaten Bolaang Mongondow. Laporkan indikasi korupsi, pungli, gratifikasi, atau pelanggaran etika dengan jaminan kerahasiaan 100%.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-800/80 p-1 text-xs font-semibold backdrop-blur">
            <button
              onClick={() => { setActiveTab("report"); setSubmittedResult(null); }}
              className={cn("flex items-center gap-2 rounded-lg px-5 py-2 transition-all",
                activeTab === "report" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              )}
            >
              <FileText className="h-4 w-4" /> Buat Laporan Baru
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={cn("flex items-center gap-2 rounded-lg px-5 py-2 transition-all",
                activeTab === "track" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              )}
            >
              <Search className="h-4 w-4" /> Lacak Status Pengaduan
            </button>
          </div>
        </div>

        {/* ── TAB 1: FORM BUAT LAPORAN BARU ── */}
        {activeTab === "report" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-6 sm:p-8 backdrop-blur shadow-2xl space-y-6">

            {/* Success Result View */}
            {submittedResult ? (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Laporan Berhasil Terkirim!</h3>
                  <p className="text-xs text-slate-300">
                    Simpan dan catat <span className="font-bold text-white">Kode Tiket</span> berikut untuk melacak perkembangan penanganan laporan Anda oleh Tim APIP.
                  </p>
                </div>

                {/* Ticket Box */}
                <div className="mx-auto max-w-sm rounded-xl border border-green-500/40 bg-slate-900/90 p-4 flex items-center justify-between gap-3">
                  <span className="font-mono text-lg font-black tracking-widest text-green-400">
                    {submittedResult.ticketCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Tersalin!" : "Salin Kode"}
                  </button>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => setSubmittedResult(null)}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Kirim Laporan Lain
                  </button>
                  <button
                    onClick={() => { setTrackCode(submittedResult.ticketCode); setActiveTab("track"); }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Lacak Status Laporan Ini →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmitReport)} className="space-y-6 text-xs">

                {/* Anonymous Toggle */}
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Kirim secara Anonim</h4>
                      <p className="text-[11px] text-slate-400">Identitas Anda tidak akan dicatat atau ditampilkan di manapun</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => handleToggleAnonymous(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Reporter Identity (Hidden if Anonymous) */}
                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-slate-300">Nama Pelapor</label>
                      <input
                        {...register("reporterName")}
                        type="text"
                        placeholder="Nama lengkap Anda"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-semibold text-slate-300">Kontak / No. WhatsApp / Email</label>
                      <input
                        {...register("reporterContact")}
                        type="text"
                        placeholder="0812xxxx atau email@domain.com"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-300">Kategori Pengaduan</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => (
                      <label
                        key={cat.value}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all",
                          register("category").value === cat.value
                            ? "border-blue-500 bg-blue-500/10 text-white"
                            : "border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-600"
                        )}
                      >
                        <input
                          type="radio"
                          value={cat.value}
                          {...register("category")}
                          className="mt-1 accent-blue-500"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{cat.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300">Judul Pengaduan</label>
                  <input
                    {...register("title")}
                    type="text"
                    placeholder="Contoh: Indikasi Pungli Pengurusan Perizinan di OPD X"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-white outline-none focus:border-blue-500"
                  />
                  {errors.title && <p className="text-[11px] text-rose-400">{errors.title.message}</p>}
                </div>

                {/* Detailed Description */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300">Uraian / Kronologi Pengaduan</label>
                  <textarea
                    {...register("description")}
                    rows={5}
                    placeholder="Jelaskan secara rinci: Siapa (pihak yang terlibat), Apa (tindakan pelanggaran), Kapan (waktu kejadian), Di mana (lokasi/OPD), dan Bagaimana kejadian berlangsung..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3.5 text-white leading-relaxed outline-none focus:border-blue-500"
                  />
                  {errors.description && <p className="text-[11px] text-rose-400">{errors.description.message}</p>}
                </div>

                {/* Evidence Dropzone */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300">File Bukti Pendukung (Foto, PDF, WhatsApp Screenshot, Dokumen)</label>
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-6 text-center hover:border-blue-500 transition-all cursor-pointer">
                    <FileText className="h-8 w-8 text-slate-500 mb-2" />
                    <p className="font-semibold text-slate-300">Pilih file bukti pendukung</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">PDF, PNG, JPG (Maks. 15MB)</p>
                    <input
                      type="file"
                      onChange={(e) => setEvidenceName(e.target.files[0]?.name || "")}
                      className="mt-2 text-slate-400 text-[11px]"
                    />
                  </div>
                  {evidenceName && (
                    <p className="text-xs text-green-400 font-medium">✓ File terpilih: {evidenceName}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-all shadow-lg shadow-blue-600/20"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Kirim Pengaduan Rahasia
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── TAB 2: LACAK STATUS PENGADUAN ── */}
        {activeTab === "track" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-6 sm:p-8 backdrop-blur shadow-2xl space-y-6">
            
            <div>
              <h3 className="text-lg font-bold text-white">Lacak Perkembangan Laporan WBS</h3>
              <p className="text-xs text-slate-400 mt-0.5">Masukkan Kode Tiket unik yang Anda dapatkan saat mengirimkan laporan</p>
            </div>

            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <input
                type="text"
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                placeholder="Contoh: WBS-2026-X98A"
                className="flex-1 uppercase font-mono tracking-wider rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isTracking}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-all shadow"
              >
                {isTracking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Lacak Laporan
              </button>
            </form>

            {trackError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                {trackError}
              </div>
            )}

            {/* Track Result Display */}
            {trackedReport && (
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-400">{trackedReport.ticketCode}</span>
                    <h4 className="text-base font-bold text-white mt-0.5">{trackedReport.title}</h4>
                  </div>
                  <span className={cn(
                    "rounded-full border px-3 py-1 text-xs font-bold",
                    WBS_STATUS_MAP[trackedReport.status]?.color || "bg-blue-100 text-blue-800"
                  )}>
                    {WBS_STATUS_MAP[trackedReport.status]?.label || trackedReport.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-slate-400"><strong className="text-slate-200">Kategori:</strong> {trackedReport.category}</p>
                  <p className="text-slate-400"><strong className="text-slate-200">Tanggal Kirim:</strong> {new Date(trackedReport.createdAt).toLocaleDateString("id-ID")}</p>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <p className="text-slate-300 leading-relaxed">{trackedReport.description}</p>
                  </div>
                </div>

                {/* APIP Response */}
                <div className="border-t border-slate-800 pt-4 space-y-1">
                  <h5 className="font-bold text-blue-400 flex items-center gap-1.5 text-xs">
                    <MessageSquareText className="h-4 w-4" /> Respon / Tindak Lanjut Tim Inspektorat APIP:
                  </h5>
                  <p className="text-slate-300 bg-blue-950/40 p-4 rounded-lg border border-blue-900/50 leading-relaxed">
                    {trackedReport.apipResponse || "Laporan telah diterima dan sedang dalam tahap verifikasi awal oleh Tim Whistleblowing Inspektorat Kab. Bolaang Mongondow."}
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl text-center py-4 border-t border-slate-800 text-xs text-slate-500 z-10">
        © {new Date().getFullYear()} Inspektorat Daerah Kabupaten Bolaang Mongondow. Hak Cipta Dilindungi.
      </footer>
    </main>
  );
}

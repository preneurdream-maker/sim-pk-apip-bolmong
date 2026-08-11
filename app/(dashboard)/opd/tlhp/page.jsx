"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import {
  CheckCircle2, Clock, AlertCircle, Hourglass,
  UploadCloud, Send, FileCheck2, Loader2, X, Search,
  Calendar, Building2, FileText, CheckSquare, Info
} from "lucide-react";
import { formatRupiah, parseRupiah, cn } from "@/lib/utils";

const TLHP_STATUS_BADGES = {
  SESUAI:                { label: "Sesuai",               color: "bg-green-100 text-green-800 border-green-200" },
  BELUM_SESUAI:          { label: "Belum Sesuai",         color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  BELUM_DITINDAKLANJUTI: { label: "Belum Ditindaklanjuti",color: "bg-red-100 text-red-800 border-red-200" },
  MENUNGGU_VERIFIKASI:   { label: "Menunggu Verifikasi", color: "bg-blue-100 text-blue-800 border-blue-200" },
};

function getDeadlineBadge(deadlineDate) {
  if (!deadlineDate) {
    return { text: "60 Hari (Standar)", color: "bg-slate-100 text-slate-700" };
  }
  const now = new Date();
  const target = new Date(deadlineDate);
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { text: "⚠️ Jatuh Tempo (0 Hari)", color: "bg-red-100 text-red-800 font-bold" };
  }
  if (diffDays <= 15) {
    return { text: `⚠️ ${diffDays} Hari Lagi`, color: "bg-amber-100 text-amber-800 font-bold animate-pulse" };
  }
  return { text: `⏱ ${diffDays} Hari Tersisa`, color: "bg-blue-50 text-blue-700 font-semibold" };
}

export default function OPDTlhpPage() {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [opdNotes,   setOpdNotes]   = useState("");
  const [currency,   setCurrency]   = useState("");
  const [fileName,   setFileName]   = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRecommendations = () => {
    setLoading(true);
    fetch("/api/v1/opd/recommendations")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          // Fallback mock recommendations for demo
          setItems([
            {
              id: "tlhp-1",
              recommendation: "Penyetoran sisa kelebihan pembayaran belanja modal gedung kantor ke Kas Daerah.",
              opdName: "Dinas Kesehatan Kab. Bolmong",
              lhpOrigin: "LHP Kepatuhan LKPD Tahun 2025",
              deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
              nilaiKerugian: "45000000",
              nilaiSetorKerugian: "0",
              status: "BELUM_DITINDAKLANJUTI",
              proofs: [],
            },
            {
              id: "tlhp-2",
              recommendation: "Penyusunan dan pengesahan SOP Pelaksanaan Administrasi Penatausahaan Barang Milik Daerah.",
              opdName: "Dinas Kesehatan Kab. Bolmong",
              lhpOrigin: "LHP Kinerja Pelayanan Kesehatan 2025",
              deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
              nilaiKerugian: "0",
              nilaiSetorKerugian: "0",
              status: "BELUM_SESUAI",
              opdNotes: "Draft SOP sudah disusun, menunggu penandatanganan Kepala Dinas.",
              proofs: [{ id: "p1", fileName: "Draft_SOP_BMD_Dinkes.pdf" }],
            },
            {
              id: "tlhp-3",
              recommendation: "Pengembalian honorarium ganda atas kegiatan penyuluhan kesehatan.",
              opdName: "Dinas Kesehatan Kab. Bolmong",
              lhpOrigin: "LHP Kepatuhan BOK 2025",
              deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              nilaiKerugian: "12500000",
              nilaiSetorKerugian: "12500000",
              status: "MENUNGGU_VERIFIKASI",
              opdNotes: "Telah disetor lunas via Bank SulutGo STS No. 049/STS/DINKES/2026.",
              proofs: [{ id: "p2", fileName: "Bukti_STS_Bank_SulutGo.pdf" }],
            },
            {
              id: "tlhp-4",
              recommendation: "Perbaikan inventarisir aset alat kesehatan di Puskesmas Dumoga.",
              opdName: "Dinas Kesehatan Kab. Bolmong",
              lhpOrigin: "LHP Sistem Pengendalian Intern 2025",
              deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
              nilaiKerugian: "0",
              nilaiSetorKerugian: "0",
              status: "SESUAI",
              auditorVerification: "Telah diverifikasi sesuai dengan hasil cek fisik Tim APIP.",
              proofs: [{ id: "p3", fileName: "Berita_Acara_Inventarisir.pdf" }],
            },
          ]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const openActionModal = (item) => {
    setSelected(item);
    setOpdNotes(item.opdNotes || "");
    setCurrency(item.nilaiSetorKerugian ? formatRupiah(item.nilaiSetorKerugian) : "");
    setFileName("");
    setModalOpen(true);
  };

  const handleCurrencyChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCurrency(raw ? formatRupiah(raw) : "");
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/opd/recommendations/${selected.id}/proofs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opdNotes,
          nilaiSetorKerugian: currency ? parseRupiah(currency) : 0,
          fileName: fileName || "Bukti_Tindak_Lanjut_OPD.pdf",
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setModalOpen(false);
      } else {
        // Fallback update state locally if offline
        setItems((prev) =>
          prev.map((item) =>
            item.id === selected.id
              ? {
                  ...item,
                  status: "MENUNGGU_VERIFIKASI",
                  opdNotes,
                  nilaiSetorKerugian: currency ? parseRupiah(currency) : 0,
                  proofs: [...(item.proofs || []), { id: Date.now().toString(), fileName: fileName || "Bukti_TLHP_Uploaded.pdf" }],
                }
              : item
          )
        );
        setModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats Counters
  const countSesuai = items.filter((i) => i.status === "SESUAI").length;
  const countBelumSesuai = items.filter((i) => i.status === "BELUM_SESUAI").length;
  const countBelumDitindak = items.filter((i) => i.status === "BELUM_DITINDAKLANJUTI").length;
  const countMenungguVerif = items.filter((i) => i.status === "MENUNGGU_VERIFIKASI").length;

  const filteredItems = items.filter((i) =>
    i.recommendation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.lhpOrigin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header
        title="Portal e-TLHP OPD Auditee"
        subtitle="Pemantauan & Tindak Lanjut Rekomendasi Hasil Pemeriksaan Inspektorat"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Welcome OPD Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="inline-block rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-0.5 text-xs text-blue-300 font-semibold">
              Portal Tindak Lanjut Online
            </span>
            <h2 className="text-xl font-bold">Dinas Kesehatan Kab. Bolaang Mongondow</h2>
            <p className="text-xs text-slate-300">
              Batas waktu penyelesaian rekomendasi adalah 60 (enam puluh) hari sejak LHP diterima.
            </p>
          </div>
          <Building2 className="h-12 w-12 text-blue-400 opacity-40 shrink-0 hidden sm:block" />
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <div className="flex items-center justify-between text-green-700">
              <span className="text-xs font-bold uppercase">Sesuai</span>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{countSesuai}</p>
            <p className="text-xs text-slate-600 mt-0.5">Rekomendasi Selesai (100%)</p>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
            <div className="flex items-center justify-between text-yellow-700">
              <span className="text-xs font-bold uppercase">Belum Sesuai</span>
              <Hourglass className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{countBelumSesuai}</p>
            <p className="text-xs text-slate-600 mt-0.5">Perlu Kelengkapan Dokumen</p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <div className="flex items-center justify-between text-red-700">
              <span className="text-xs font-bold uppercase">Belum Ditindaklanjuti</span>
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{countBelumDitindak}</p>
            <p className="text-xs text-slate-600 mt-0.5">Memerlukan Respon Segera</p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-xs font-bold uppercase">Menunggu Verifikasi</span>
              <Clock className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{countMenungguVerif}</p>
            <p className="text-xs text-slate-600 mt-0.5">Sedang Diproses Tim APIP</p>
          </div>
        </div>

        {/* Recommendations Table Section */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-0">
          
          {/* Table Header Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 p-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daftar Rekomendasi LHP</h3>
              <p className="text-xs text-slate-500">Pilih rekomendasi untuk mengunggah bukti penyelesaian</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari rekomendasi atau LHP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-blue-600" />
              <p className="text-xs">Memuat rekomendasi OPD...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <CheckSquare className="mx-auto mb-2 h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">Tidak ada rekomendasi ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b">
                  <tr>
                    <th className="px-6 py-3.5">Uraian Rekomendasi</th>
                    <th className="px-6 py-3.5">Asal LHP</th>
                    <th className="px-6 py-3.5">Batas Waktu (60 Hari)</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const badge = TLHP_STATUS_BADGES[item.status] || TLHP_STATUS_BADGES.BELUM_DITINDAKLANJUTI;
                    const countdown = getDeadlineBadge(item.deadline);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 leading-relaxed max-w-md">
                            {item.recommendation}
                          </p>
                          {item.nilaiKerugian && parseInt(item.nilaiKerugian) > 0 && (
                            <p className="text-[11px] text-red-600 font-medium mt-1">
                              Nilai Kerugian: Rp {formatRupiah(item.nilaiKerugian)}
                              {item.nilaiSetorKerugian && parseInt(item.nilaiSetorKerugian) > 0 && (
                                <span className="text-green-600 ml-2">
                                  (Disetor: Rp {formatRupiah(item.nilaiSetorKerugian)})
                                </span>
                              )}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">
                          {item.lhpOrigin || "LHP Inspektorat 2026"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("inline-block rounded-full px-2.5 py-1 text-[11px]", countdown.color)}>
                            {countdown.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("inline-block rounded-full border px-2.5 py-0.5 font-bold text-[11px]", badge.color)}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openActionModal(item)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700 transition-all shadow-sm"
                          >
                            <UploadCloud className="h-3.5 w-3.5" /> Tindak Lanjut
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── MODAL UNGGAH BUKTI TLHP ── */}
      {modalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Unggah Bukti Tindak Lanjut</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Selected Item Summary */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900 space-y-1">
              <p className="font-semibold">{selected.recommendation}</p>
              <p className="text-[11px] text-blue-700">Asal: {selected.lhpOrigin}</p>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4 text-xs">
              
              {/* Penjelasan / Tindakan yang Dilakukan */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Uraian Tindakan Perbaikan / Keterangan
                </label>
                <textarea
                  required
                  rows={4}
                  value={opdNotes}
                  onChange={(e) => setOpdNotes(e.target.value)}
                  placeholder="Uraikan langkah nyata yang telah dilakukan OPD untuk menindaklanjuti rekomendasi ini..."
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* Setor Kerugian (jika ada kerugian) */}
              {selected.nilaiKerugian && parseInt(selected.nilaiKerugian) > 0 && (
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Jumlah Nilai yang Disetor ke Kas Daerah (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-400">Rp</span>
                    <input
                      type="text"
                      value={currency}
                      onChange={handleCurrencyChange}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Total Kerugian LHP: Rp {formatRupiah(selected.nilaiKerugian)}</p>
                </div>
              )}

              {/* File Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">File Bukti Dokumen (STS, Foto, PDF, SK)</label>
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer">
                  <UploadCloud className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="font-semibold text-slate-700">Seret & Lepas file bukti di sini</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">STS Bank, PDF Berita Acara, Foto Fisik (Maks 10MB)</p>
                  <input
                    type="file"
                    onChange={(e) => setFileName(e.target.files[0]?.name || "")}
                    className="mt-2 text-slate-500 text-[11px]"
                  />
                </div>
                {fileName && (
                  <p className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 p-2 rounded border border-green-200">
                    <FileCheck2 className="h-4 w-4" /> {fileName}
                  </p>
                )}
              </div>

              {/* Existing Uploaded Proofs */}
              {selected.proofs && selected.proofs.length > 0 && (
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Bukti yang Sudah Di-upload Sebelumnya:</label>
                  <ul className="space-y-1">
                    {selected.proofs.map((p) => (
                      <li key={p.id} className="flex items-center justify-between rounded bg-slate-50 p-2 border">
                        <span className="font-mono text-slate-700">{p.fileName}</span>
                        <span className="text-[10px] text-green-600 font-bold">✓ Uploaded</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-all shadow"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit ke APIP (Menunggu Verifikasi)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

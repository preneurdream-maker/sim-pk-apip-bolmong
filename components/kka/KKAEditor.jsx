"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { kkaSchema } from "@/lib/validations";
import { formatRupiah, parseRupiah, KKA_STATUS_CONFIG, cn } from "@/lib/utils";
import { Save, Send, AlertCircle, Loader2, FileText, Scale, Search, Zap, Lightbulb } from "lucide-react";
import EvidenUploader from "@/components/kka/EvidenUploader";
import ReviewSidebar from "@/components/kka/ReviewSidebar";

// 5 RCA Components configuration
const RCA_FIELDS = [
  {
    key:         "kondisi",
    label:       "1. Kondisi (Fakta / Temuan)",
    icon:        FileText,
    placeholder: "Deskripsikan kondisi yang ditemukan di lapangan secara faktual dan objektif...\n\nContoh: Berdasarkan pemeriksaan dokumen pengadaan barang/jasa, ditemukan bahwa...",
    color:       "blue",
  },
  {
    key:         "kriteria",
    label:       "2. Kriteria (Regulasi / Ketentuan)",
    icon:        Scale,
    placeholder: "Sebutkan peraturan, ketentuan, atau standar yang seharusnya dipenuhi...\n\nContoh: Berdasarkan Peraturan Presiden No. 16 Tahun 2018 tentang Pengadaan Barang/Jasa...",
    color:       "indigo",
  },
  {
    key:         "sebab",
    label:       "3. Sebab (Root Cause Analysis / 5 Whys)",
    icon:        Search,
    placeholder: "Uraikan akar penyebab terjadinya kondisi tersebut (gunakan metode 5 Whys)...\n\nMengapa 1: ...\nMengapa 2: ...\nMengapa 3: ...",
    color:       "amber",
  },
  {
    key:         "akibat",
    label:       "4. Akibat (Dampak / Risiko)",
    icon:        Zap,
    placeholder: "Jelaskan dampak atau risiko yang timbul dari kondisi yang ditemukan...\n\nContoh: Akibat dari kondisi tersebut, terdapat potensi kerugian negara sebesar...",
    color:       "red",
  },
  {
    key:         "rekomendasi",
    label:       "5. Rekomendasi (Tindakan Perbaikan)",
    icon:        Lightbulb,
    placeholder: "Berikan rekomendasi tindakan perbaikan yang spesifik, terukur, dan dapat dilaksanakan...\n\nContoh: Kami merekomendasikan kepada Kepala OPD untuk...",
    color:       "green",
  },
];

const COLOR_MAP = {
  blue:   "border-blue-200 bg-blue-50 text-blue-700",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  amber:  "border-amber-200 bg-amber-50 text-amber-700",
  red:    "border-red-200 bg-red-50 text-red-700",
  green:  "border-green-200 bg-green-50 text-green-700",
};

const FOCUS_MAP = {
  blue:   "focus:border-blue-500 focus:ring-blue-500/20",
  indigo: "focus:border-indigo-500 focus:ring-indigo-500/20",
  amber:  "focus:border-amber-500 focus:ring-amber-500/20",
  red:    "focus:border-red-500 focus:ring-red-500/20",
  green:  "focus:border-green-500 focus:ring-green-500/20",
};

export default function KKAEditor({ kka, reviews = [], userRole, onSave, onSubmit }) {
  const [currency,    setCurrency]    = useState(kka?.nilaiKerugian ? formatRupiah(String(kka.nilaiKerugian)) : "");
  const [isSaving,    setIsSaving]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab,   setActiveTab]   = useState("form"); // "form" | "eviden"
  const [notes,       setNotes]       = useState(reviews);

  const isReadOnly = kka?.status === "SUBMITTED" || kka?.status === "APPROVED";
  const statusConf = KKA_STATUS_CONFIG[kka?.status || "DRAFT"];

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(kkaSchema),
    defaultValues: {
      kondisi:      kka?.kondisi      || "",
      kriteria:     kka?.kriteria     || "",
      sebab:        kka?.sebab        || "",
      akibat:       kka?.akibat       || "",
      rekomendasi:  kka?.rekomendasi  || "",
      nilaiKerugian: currency,
    },
  });

  const handleCurrencyChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCurrency(raw ? formatRupiah(raw) : "");
  };

  const handleSave = async (data) => {
    setIsSaving(true);
    await onSave?.({ ...data, nilaiKerugian: parseRupiah(currency) });
    setIsSaving(false);
  };

  const handleSubmitKKA = async (data) => {
    setIsSubmitting(true);
    await onSubmit?.({ ...data, nilaiKerugian: parseRupiah(currency) });
    setIsSubmitting(false);
  };

  const handleToggleResolve = async (noteId) => {
    setNotes((prev) =>
      prev.map((n) => n.id === noteId ? { ...n, isResolved: !n.isResolved } : n)
    );
    await fetch(`/api/v1/kka/reviews/${noteId}/resolve`, { method: "PATCH" });
  };

  return (
    <div className="flex h-full gap-0">

      {/* ── Main Editor Panel ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* KKA Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-slate-900 text-sm">
              {kka?.engagement?.title || "KKA Editor"}
            </h2>
            <span className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              statusConf.color
            )}>
              {statusConf.label}
            </span>
            {isReadOnly && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                Read-Only
              </span>
            )}
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab("form")}
              className={cn("rounded-md px-3 py-1.5 transition-all",
                activeTab === "form" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
              )}
            >Form RCA</button>
            <button
              onClick={() => setActiveTab("eviden")}
              className={cn("rounded-md px-3 py-1.5 transition-all",
                activeTab === "eviden" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
              )}
            >Eviden</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "form" ? (
            <form className="space-y-0">

              {/* 5 RCA Fields */}
              {RCA_FIELDS.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key} className="border-b border-slate-100 p-6">
                    {/* Field Label */}
                    <label className={cn(
                      "mb-3 flex items-center gap-2 text-sm font-semibold",
                      `text-${field.color}-700`
                    )}>
                      <span className={cn("flex h-6 w-6 items-center justify-center rounded-md text-xs", COLOR_MAP[field.color])}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {field.label}
                    </label>

                    <textarea
                      {...register(field.key)}
                      disabled={isReadOnly}
                      rows={5}
                      placeholder={isReadOnly ? "(tidak dapat diedit)" : field.placeholder}
                      className={cn(
                        "w-full resize-y rounded-lg border px-4 py-3 text-sm leading-relaxed outline-none transition-all",
                        "focus:ring-2 placeholder:text-slate-300",
                        FOCUS_MAP[field.color],
                        isReadOnly
                          ? "cursor-not-allowed bg-slate-50 text-slate-500 border-slate-200"
                          : "border-slate-200 bg-white hover:border-slate-300",
                        errors[field.key] ? "border-red-400 bg-red-50" : ""
                      )}
                    />
                    {errors[field.key] && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors[field.key].message}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Nilai Kerugian */}
              <div className="border-b border-slate-100 p-6">
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Nilai Kerugian Daerah (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    Rp
                  </span>
                  <input
                    value={currency}
                    onChange={handleCurrencyChange}
                    disabled={isReadOnly}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className={cn(
                      "w-full rounded-lg border py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all",
                      "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                      isReadOnly
                        ? "cursor-not-allowed bg-slate-50 text-slate-500 border-slate-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  />
                </div>
                {currency && (
                  <p className="mt-1 text-xs text-slate-500">
                    Terbilang: Rp {currency}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {!isReadOnly && (
                <div className="flex items-center justify-between p-6 bg-slate-50">
                  <p className="text-xs text-slate-500">
                    {isDirty ? "Ada perubahan yang belum disimpan" : "Semua perubahan tersimpan"}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleSubmit(handleSave)}
                      disabled={isSaving || !isDirty}
                      className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white
                        px-4 py-2 text-sm font-semibold text-slate-700 transition-all
                        hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Simpan Draft
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit(handleSubmitKKA)}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2
                        text-sm font-semibold text-white shadow-sm transition-all
                        hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Submit ke Ketua Tim
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="p-6">
              <EvidenUploader kkaId={kka?.id} />
            </div>
          )}
        </div>
      </div>

      {/* ── Review Sidebar ── */}
      <div className="w-80 shrink-0 border-l border-slate-200 bg-white">
        <ReviewSidebar
          notes={notes}
          kkaStatus={kka?.status}
          userRole={userRole}
          onToggleResolve={handleToggleResolve}
        />
      </div>
    </div>
  );
}

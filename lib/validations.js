// Zod Validation Schemas — SIM-PK APIP
import { z } from "zod";

// ─── LOGIN SCHEMA ───────────────────────────────────────────
export const loginSchema = z.object({
  credential: z
    .string()
    .min(1, "NIP / Email wajib diisi")
    .max(100),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .max(100),
  rememberMe: z.boolean().optional().default(false),
});

// ─── CHANGE PASSWORD SCHEMA ─────────────────────────────────
export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Harus mengandung huruf kapital")
      .regex(/[0-9]/, "Harus mengandung angka"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

// ─── EVIDEN NAMING CONVENTION ───────────────────────────────
// Format: [Kode_Elemen]_[Kode_Topik]_[Jenis_Dokumen]_[Tahun]_[Nama_Detail].pdf
// Contoh: E2_T1_KKA_2026_Pengadaan_Barang.pdf
export const EVIDEN_NAMING_REGEX =
  /^E[1-5]_T\d+_(KKA|LHP|DPP|SK|SOP|PEDOMAN|Sertifikat)_\d{4}_.+\.pdf$/i;

export const evidenSchema = z.object({
  fileName: z
    .string()
    .min(1, "Nama file wajib diisi")
    .regex(
      EVIDEN_NAMING_REGEX,
      "Format nama file salah. Gunakan: E[1-5]_T[no]_[Jenis]_[Tahun]_[Detail].pdf\nContoh: E2_T1_KKA_2026_Pengadaan_Barang.pdf"
    ),
});

// ─── KKA SCHEMA ─────────────────────────────────────────────
export const kkaSchema = z.object({
  kondisi: z
    .string()
    .min(10, "Kondisi minimal 10 karakter")
    .max(5000),
  kriteria: z
    .string()
    .min(10, "Kriteria minimal 10 karakter")
    .max(5000),
  sebab: z
    .string()
    .min(10, "Sebab (Root Cause) minimal 10 karakter")
    .max(5000),
  akibat: z
    .string()
    .min(10, "Akibat minimal 10 karakter")
    .max(5000),
  rekomendasi: z
    .string()
    .min(10, "Rekomendasi minimal 10 karakter")
    .max(5000),
  nilaiKerugian: z
    .string()
    .optional()
    .transform((val) =>
      val ? parseInt(val.replace(/\D/g, ""), 10) : 0
    ),
});

// ─── REVIEW NOTE SCHEMA (Ketua Tim & Dalnis) ───────────────
export const reviewNoteSchema = z.object({
  sectionTag: z.enum(["KONDISI", "KRITERIA", "SEBAB", "AKIBAT", "REKOMENDASI", "EVIDEN", "UMUM"], {
    errorMap: () => ({ message: "Pilih bagian/tag yang valid" }),
  }),
  note: z
    .string()
    .min(5, "Catatan reviu minimal 5 karakter")
    .max(3000, "Catatan reviu maksimal 3000 karakter"),
});

// ─── KKA STATUS UPDATE SCHEMA ──────────────────────────────
export const kkaStatusUpdateSchema = z.object({
  status: z.enum([
    "REVISION_REQUESTED",
    "APPROVED_BY_KETUA_TIM",
    "APPROVED_BY_DALNIS",
    "APPROVED",
    "REVISION",
  ]),
  summaryNote: z.string().optional(),
});

// ─── QUALITY EVALUATION SCHEMA (1-5 Sliders) ──────────────
export const qualityEvaluationSchema = z.object({
  buktiAuditScore: z.number().min(1).max(5),
  rcaScore: z.number().min(1).max(5),
  rekomendasiScore: z.number().min(1).max(5),
  notes: z.string().optional(),
});

// ─── OPD e-TLHP PROOF SUBMISSION SCHEMA ────────────────────
export const tlhpProofSchema = z.object({
  opdNotes: z
    .string()
    .min(10, "Penjelasan / tindakan yang telah dilakukan minimal 10 karakter"),
  nilaiSetorKerugian: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val.replace(/\D/g, ""), 10) : 0)),
  fileName: z.string().optional(),
});

// ─── PUBLIC WBS & GRATIFIKASI REPORT SCHEMA ────────────────
export const wbsReportSchema = z.object({
  isAnonymous: z.boolean().default(false),
  reporterName: z.string().optional(),
  reporterContact: z.string().optional(),
  category: z.enum(["CORRUPTION_PUNGLI", "GRATIFICATION", "ABUSE_OF_POWER", "SOP_VIOLATION"], {
    errorMap: () => ({ message: "Pilih kategori pengaduan yang valid" }),
  }),
  title: z.string().min(5, "Judul pengaduan minimal 5 karakter"),
  description: z.string().min(15, "Deskripsi pengaduan minimal 15 karakter"),
  evidenceUrl: z.string().optional(),
});

// ─── PK APIP EVIDENCE UPLOAD SCHEMA ───────────────────────
export const pkEvidenceUploadSchema = z.object({
  topicId: z.string().min(1, "Topic ID wajib diisi"),
  fileName: z.string().min(1, "Nama file eviden wajib diisi"),
  uploadedBy: z.string().optional(),
});

// ─── BPKP EVALUATOR ASSESSMENT SCHEMA ────────────────────
export const bpkpAssessmentSchema = z.object({
  topicId: z.string().min(1, "Topic ID wajib diisi"),
  bpkpScore: z.number().min(1).max(5),
  validationStatus: z.enum(["MEMENUHI", "CUKUP", "KURANG_BUKTI"]),
  bpkpNotes: z.string().optional(),
});

// ─── SIM-SDM JPL LOG SCHEMA ────────────────────────────────
export const jplLogSchema = z.object({
  auditorSdmId: z.string().min(1, "Auditor ID wajib diisi"),
  trainingName: z.string().min(3, "Nama diklat/pelatihan minimal 3 karakter"),
  organizer: z.string().min(2, "Penyelenggara diklat wajib diisi"),
  jplHours: z.number().min(1, "Jumlah Jam Pelajaran (JPL) minimal 1"),
  certificateUrl: z.string().optional(),
});




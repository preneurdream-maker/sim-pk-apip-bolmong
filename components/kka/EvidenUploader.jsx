"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileCheck2, XCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { EVIDEN_NAMING_REGEX } from "@/lib/validations";
import { cn } from "@/lib/utils";

function validateFileName(name) {
  return EVIDEN_NAMING_REGEX.test(name);
}

export default function EvidenUploader({ kkaId, onUploaded }) {
  const [files,   setFiles]   = useState([]);
  const [error,   setError]   = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    setError("");
    const validated = acceptedFiles.map((file) => ({
      file,
      valid:   validateFileName(file.name),
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...validated]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   { "application/pdf": [".pdf"] },
    maxSize:  10 * 1024 * 1024, // 10MB
    onDropRejected: (rejected) => {
      const reasons = rejected.map((r) => r.errors[0].message).join(", ");
      setError(`File ditolak: ${reasons}`);
    },
  });

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const validCount   = files.filter((f) => f.valid).length;
  const invalidCount = files.filter((f) => !f.valid).length;

  return (
    <div className="space-y-4">

      {/* Naming Convention Info */}
      <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-800">Standar Penamaan Eviden</p>
          <code className="block rounded bg-blue-100 px-2 py-1 text-xs text-blue-900">
            E[1-5]_T[no]_[Jenis]_[Tahun]_[Detail].pdf
          </code>
          <p className="text-xs text-blue-700">
            Contoh: <code className="font-medium">E2_T1_KKA_2026_Pengadaan_Barang.pdf</code>
          </p>
          <p className="text-xs text-blue-600">
            Jenis yang valid: KKA, LHP, DPP, SK, SOP, PEDOMAN, Sertifikat
          </p>
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all",
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className={cn(
          "mb-3 h-10 w-10 transition-colors",
          isDragActive ? "text-blue-500" : "text-slate-400 group-hover:text-blue-400"
        )} />
        <p className="font-semibold text-slate-700">
          {isDragActive ? "Lepaskan file di sini..." : "Seret & Lepas file PDF"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          atau <span className="text-blue-600 underline">klik untuk memilih</span>
        </p>
        <p className="mt-2 text-xs text-slate-400">Hanya file PDF, maks. 10MB per file</p>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <XCircle className="h-4 w-4" />{error}
        </p>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {files.length} file dipilih
            </p>
            <div className="flex gap-3 text-xs">
              {validCount > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3"/>{validCount} valid
                </span>
              )}
              {invalidCount > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-3 w-3"/>{invalidCount} nama tidak sesuai
                </span>
              )}
            </div>
          </div>

          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((f, idx) => (
              <li key={idx} className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-sm",
                f.valid
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              )}>
                {f.valid
                  ? <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                }
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-slate-800">{f.file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(f.file.size / 1024).toFixed(1)} KB
                  </p>
                  {!f.valid && (
                    <p className="mt-0.5 text-xs text-red-600">
                      ⚠ Nama file tidak sesuai standar penamaan
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          {invalidCount > 0 && (
            <p className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              ⚠ File dengan nama tidak sesuai tidak akan dapat di-submit. Silakan rename file sesuai standar penamaan terlebih dahulu.
            </p>
          )}

          {validCount > 0 && (
            <button
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold
                text-white transition-all hover:bg-blue-700"
              onClick={() => onUploaded?.(files.filter(f => f.valid).map(f => f.file))}
            >
              Upload {validCount} File Valid
            </button>
          )}
        </div>
      )}
    </div>
  );
}

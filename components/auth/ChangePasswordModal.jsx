"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/lib/validations";
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";

export default function ChangePasswordModal({ open, onSuccess }) {
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    const res = await fetch("/api/v1/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setServerError(result.error || "Terjadi kesalahan.");
      return;
    }

    onSuccess?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">

        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <ShieldAlert className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Ganti Password Pertama Kali
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Demi keamanan akun Anda, wajib mengganti password default sebelum melanjutkan.
            </p>
          </div>
        </div>

        {serverError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Password Baru
            </label>
            <div className="relative">
              <input
                {...register("newPassword")}
                type={showNew ? "text" : "password"}
                placeholder="Min. 8 karakter, huruf kapital + angka"
                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm outline-none transition-all
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                  ${errors.newPassword ? "border-red-400 bg-red-50" : "border-slate-200"}`}
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                placeholder="Ulangi password baru"
                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm outline-none transition-all
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                  ${errors.confirmPassword ? "border-red-400 bg-red-50" : "border-slate-200"}`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Password Rules Info */}
          <ul className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500"/>Minimal 8 karakter</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500"/>Mengandung huruf kapital (A-Z)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500"/>Mengandung angka (0-9)</li>
          </ul>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600
              py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700
              disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
            ) : (
              <><KeyRound className="h-4 w-4" /> Simpan Password Baru</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

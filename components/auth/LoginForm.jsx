"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { loginSchema } from "@/lib/validations";
import ChangePasswordModal from "@/components/auth/ChangePasswordModal";

export default function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") || "/";

  const [showPassword,    setShowPassword]    = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);
  const [serverError,     setServerError]     = useState("");
  const [showChangeModal, setShowChangeModal] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { credential: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    const result = await signIn("credentials", {
      credential: data.credential,
      password:   data.password,
      redirect:   false,
    });

    setIsLoading(false);

    if (result?.error) {
      setServerError(result.error);
      return;
    }

    // Fetch session to check isPasswordDefault
    const sessionRes = await fetch("/api/auth/session");
    const session    = await sessionRes.json();

    if (session?.user?.isPasswordDefault) {
      setShowChangeModal(true);
      return;
    }

    router.push(callbackUrl !== "/" ? callbackUrl : getRedirectPath(session?.user?.role));
    router.refresh();
  };

  const getRedirectPath = (role) => {
    const map = {
      AUDITOR: "/auditor/dashboard",
      IRBAN:   "/irban/dashboard",
      ADMIN:   "/admin/dashboard",
      OPD:     "/opd/tlhp",
      BPKP:    "/bpkp/dashboard",
    };
    return map[role] || "/";
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Server Error Alert */}
        {serverError && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* NIP / Email Field */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            NIP / Username / Email
          </label>
          <input
            {...register("credential")}
            type="text"
            placeholder="198004122005011002 atau email@inspektorat.go.id"
            autoComplete="username"
            className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              ${errors.credential
                ? "border-red-400 bg-red-50"
                : "border-slate-200 bg-white hover:border-slate-300"
              }`}
          />
          {errors.credential && (
            <p className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {errors.credential.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password Anda"
              autoComplete="current-password"
              className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm outline-none transition-all
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                ${errors.password
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <input
            {...register("rememberMe")}
            type="checkbox"
            id="rememberMe"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer">
            Ingat Saya di perangkat ini
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600
            px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all
            hover:bg-blue-700 hover:shadow-md active:scale-[0.98]
            disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Memverifikasi...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Masuk ke Sistem
            </>
          )}
        </button>

        {/* Help text */}
        <p className="text-center text-xs text-slate-500">
          Lupa password? Hubungi{" "}
          <span className="font-semibold text-blue-600">Admin Sekretariat</span>
        </p>
      </form>

      {/* Mandatory First-Login Password Change Modal */}
      <ChangePasswordModal
        open={showChangeModal}
        onSuccess={() => {
          setShowChangeModal(false);
          router.refresh();
          router.push("/auditor/dashboard");
        }}
      />
    </>
  );
}

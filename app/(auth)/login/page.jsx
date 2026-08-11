import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Login — SIM-PK APIP Inspektorat Kab. Bolaang Mongondow",
  description: "Masuk ke Sistem Informasi Manajemen Pengawasan Intern (SIM-PK APIP)",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">

      {/* Background grid decoration */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      {/* Glowing orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative w-full max-w-md">

        {/* Header Card */}
        <div className="mb-6 text-center">
          {/* Logo Badge */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl
            bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SIM-PK APIP</h1>
          <p className="mt-1 text-sm text-blue-200/80">
            e-Audit & Pengawasan Intern
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Inspektorat Daerah Kab. Bolaang Mongondow
          </p>
          <span className="mt-2 inline-block rounded-full border border-blue-500/30 bg-blue-500/10
            px-3 py-0.5 text-xs text-blue-300">
            Peraturan BPKP No. 6 Tahun 2025
          </span>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
          <h2 className="mb-1 text-lg font-semibold text-white">Selamat Datang</h2>
          <p className="mb-6 text-sm text-slate-400">
            Masuk dengan NIP, Username, atau Email dinas Anda
          </p>
          <Suspense fallback={<div className="text-white">Memuat...</div>}>
            <LoginFormWrapper />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Inspektorat Daerah Kab. Bolaang Mongondow.
          Semua hak dilindungi.
        </p>
      </div>
    </main>
  );
}

// Wrapper needed because LoginForm uses useSearchParams
function LoginFormWrapper() {
  return <LoginForm />;
}

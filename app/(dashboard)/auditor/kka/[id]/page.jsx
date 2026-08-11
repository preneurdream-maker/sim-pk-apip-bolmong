"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import KKAEditor from "@/components/kka/KKAEditor";
import Header from "@/components/layout/Header";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function KKADetailPage() {
  const { id }    = useParams();
  const router    = useRouter();
  const { data: session } = useSession();
  const [kka,    setKka]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!id || id === "new") {
      setKka({ status: "DRAFT", kondisi: "", kriteria: "", sebab: "", akibat: "", rekomendasi: "" });
      setLoading(false);
      return;
    }
    fetch(`/api/v1/kka/${id}`)
      .then((r) => r.json())
      .then((data) => { setKka(data); setLoading(false); })
      .catch(() => { setError("Gagal memuat KKA."); setLoading(false); });
  }, [id]);

  const handleSave = async (data) => {
    const url    = id === "new" ? "/api/v1/kka" : `/api/v1/kka/${id}`;
    const method = id === "new" ? "POST" : "PATCH";
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });
    const saved = await res.json();
    if (id === "new" && saved.id) {
      router.replace(`/auditor/kka/${saved.id}`);
    }
    setKka(saved);
  };

  const handleSubmit = async (data) => {
    await handleSave({ ...data, status: "SUBMITTED" });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <>
      <Header
        title={id === "new" ? "Buat KKA Baru" : "Edit KKA"}
        subtitle="Kertas Kerja Audit — 5 Komponen RCA"
      />
      <div className="flex-1 overflow-hidden">
        <KKAEditor
          kka={kka}
          reviews={kka?.reviews || []}
          userRole={session?.user?.role}
          onSave={handleSave}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QAReviewWorkspace from "@/components/review/QAReviewWorkspace";
import { notFound } from "next/navigation";

export const metadata = {
  title: "QA Reviu & Persetujuan KKA — SIM-PK APIP",
};

export default async function QAReviewPage({ params }) {
  const session = await auth();
  const { id } = await params;

  // Fetch KKA with engagement, evidens, reviews, createdBy
  const kka = await prisma.kKA.findUnique({
    where: { id },
    include: {
      engagement: true,
      createdBy:  { select: { fullName: true, role: true, nip: true } },
      evidens:    true,
      reviews:    {
        include: { reviewer: { select: { fullName: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!kka) {
    // If not found in DB yet, fallback mock KKA structure so developer can inspect page
    const mockKKA = {
      id,
      status: "SUBMITTED",
      kondisi: "Ditemukan selisih pembayaran fisik belanja modal jalan sebesar Rp 45.000.000 pada Dinas PU.",
      kriteria: "Peraturan Presiden Nomor 16 Tahun 2018 tentang Pengadaan Barang/Jasa Pemerintah Pasal 51.",
      sebab: "Mengapa 1: Kurangnya pengawasan lapangan oleh PPK.\nMengapa 2: Panitia penerima tidak melakukan pengukuran ulang fisik secara menyeluruh.",
      akibat: "Potensi kerugian keuangan daerah sebesar Rp 45.000.000.",
      rekomendasi: "Merekomendasikan kepada Kepala OPD untuk memproses pengembalian ke Kas Daerah.",
      nilaiKerugian: BigInt(45000000),
      createdBy: { fullName: "Auditor Pertama (Simulasi)" },
      evidens: [
        { id: "e1", fileName: "E2_T1_KKA_2026_Fisik_Jalan.pdf", fileSize: "2.4 MB" }
      ],
      reviews: [],
    };
    return (
      <QAReviewWorkspace
        kka={{ ...mockKKA, nilaiKerugian: mockKKA.nilaiKerugian.toString() }}
        engagement={{ id: "eng1", title: "Audit Pengadaan Jalan Dinas PU 2026", status: "ACTIVE" }}
        userRole={session?.user?.role || "IRBAN"}
      />
    );
  }

  return (
    <QAReviewWorkspace
      kka={{ ...kka, nilaiKerugian: kka.nilaiKerugian?.toString() }}
      engagement={kka.engagement}
      userRole={session?.user?.role || "IRBAN"}
    />
  );
}

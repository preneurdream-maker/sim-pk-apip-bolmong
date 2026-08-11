import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "SIM-PK APIP — Inspektorat Kab. Bolaang Mongondow",
  description:
    "Sistem Informasi Manajemen Pengawasan Intern & e-Audit Inspektorat Daerah Kabupaten Bolaang Mongondow. Landasan Regulasi: Peraturan BPKP No. 6 Tahun 2025.",
  keywords: ["APIP", "Inspektorat", "Audit", "Bolaang Mongondow", "PK APIP"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full font-sans">{children}</body>
    </html>
  );
}

import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden bg-slate-100">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}

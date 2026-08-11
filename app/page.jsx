import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRoleDashboardPath } from "@/lib/utils";

export default async function RootPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(getRoleDashboardPath(session.user.role));
}

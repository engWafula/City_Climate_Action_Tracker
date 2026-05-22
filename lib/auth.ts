import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function isAdminAuthenticated() {
  const session = await auth();
  return session?.user.role === "admin";
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

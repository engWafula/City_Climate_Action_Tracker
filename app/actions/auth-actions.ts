"use server";

import { redirect } from "next/navigation";
import { authenticateAdmin, clearAdminSession, createAdminSession } from "@/lib/auth";

export async function loginAdmin(_state: string | null, formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const user = await authenticateAdmin(username, password);

  if (!user) {
    return "Invalid username or password.";
  }

  await createAdminSession(user.id);
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/");
}

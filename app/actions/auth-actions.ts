"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export async function loginAdmin(_state: string | null, formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/admin"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid username or password.";
    }

    throw error;
  }

  return null;
}

export async function logoutAdmin() {
  await signOut({ redirectTo: "/" });
}

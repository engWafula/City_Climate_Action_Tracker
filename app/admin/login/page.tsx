import Link from "next/link";
import { Leaf } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-700 text-white">
            <Leaf className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-normal text-slate-950">Admin sign in</h1>
            <p className="text-sm text-slate-500">Use the seeded city admin account.</p>
          </div>
        </div>
        <LoginForm />
        <Link className="mt-4 block text-center text-sm font-medium text-emerald-700 hover:text-emerald-800" href="/">
          Back to public view
        </Link>
      </section>
    </main>
  );
}

import Link from "next/link";
import { Leaf } from "lucide-react";
import { logoutAdmin } from "@/app/actions/auth-actions";
import { isAdminAuthenticated } from "@/lib/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const isAdmin = await isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-emerald-700 text-white">
              <Leaf className="h-5 w-5" aria-hidden />
            </span>
            City Climate Action Tracker
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950" href="/">
              Public
            </Link>
            <Link className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950" href="/admin">
              Admin
            </Link>
            {isAdmin ? (
              <form action={logoutAdmin}>
                <button className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950" type="submit">
                  Sign out
                </button>
              </form>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

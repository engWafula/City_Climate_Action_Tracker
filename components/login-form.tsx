"use client";

import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useActionState, useState } from "react";
import { loginAdmin } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [message, formAction, isPending] = useActionState(loginAdmin, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Username
        <span className="relative block">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input name="username" autoComplete="username" className="h-11 pl-10" placeholder="admin" required />
        </span>
      </label>
      <label className="block space-y-2 text-sm font-medium text-slate-700">
        Password
        <span className="relative block">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="h-11 pl-10 pr-11"
            placeholder="Enter password"
            required
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </button>
        </span>
      </label>
      {message ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null}
      <Button type="submit" className="h-11 w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

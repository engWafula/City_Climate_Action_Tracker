import { CheckCircle2 } from "lucide-react";

export type Toast = {
  id: number;
  message: string;
};

export function AdminActionToast({ toast }: { toast: Toast | null }) {
  if (!toast) {
    return null;
  }

  return (
    <div className="fixed right-6 top-6 z-[60] flex max-w-sm items-start gap-3 rounded-md border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg" role="status" aria-live="polite">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
      <p className="font-medium text-slate-900">{toast.message}</p>
    </div>
  );
}

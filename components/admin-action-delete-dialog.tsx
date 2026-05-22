import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClimateAction } from "@/lib/types";

export function AdminActionDeleteDialog({
  action,
  cityName,
  isDeleting,
  onCancel,
  onConfirm
}: {
  action: ClimateAction | null;
  cityName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!action) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="delete-action-title">
        <div className="space-y-2 border-b border-slate-200 px-6 py-5">
          <h2 id="delete-action-title" className="text-lg font-semibold text-slate-950">
            Delete action?
          </h2>
          <p className="text-sm text-slate-500">This will permanently remove “{action.title}” from {cityName}.</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-5">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" aria-hidden />
            {isDeleting ? "Deleting..." : "Delete action"}
          </Button>
        </div>
      </div>
    </div>
  );
}

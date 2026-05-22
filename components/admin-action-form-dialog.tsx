import { Plus, X } from "lucide-react";
import { AdminActionImportPanel } from "@/components/admin-action-import-panel";
import { startYearOptions, type DraftAction } from "@/components/admin-action-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { sectorLabels, statusLabels } from "@/lib/labels";
import { actionStatuses, sectors, type ActionStatus, type Sector } from "@/lib/types";

export function AdminActionFormDialog({
  cityName,
  draft,
  text,
  message,
  isImporting,
  isPending,
  onClose,
  onDraftChange,
  onTextChange,
  onImport,
  onSubmit
}: {
  cityName: string;
  draft: DraftAction;
  text: string;
  message: string;
  isImporting: boolean;
  isPending: boolean;
  onClose: () => void;
  onDraftChange: (draft: DraftAction) => void;
  onTextChange: (text: string) => void;
  onImport: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-7 py-6">
          <div>
            <h2 id="action-modal-title" className="text-2xl font-semibold text-slate-950">
              {draft.id ? "Edit action" : "Add action"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">Use free text to prefill the draft, or enter the action details manually.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close action modal" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto px-7 py-7 lg:grid-cols-[0.75fr_1.25fr]">
          <AdminActionImportPanel text={text} message={message} isImporting={isImporting} onTextChange={onTextChange} onImport={onImport} />

          <form action={onSubmit} className="flex min-h-full flex-col">
            <div className="space-y-7">
              <header className="space-y-1">
                <h3 className="text-sm font-semibold uppercase text-slate-500">Action details</h3>
                <p className="text-sm text-slate-500">Complete the fields before saving the action to {cityName}.</p>
              </header>
              <input type="hidden" name="id" value={draft.id ?? ""} />

              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Action title
                <Input
                  name="title"
                  value={draft.title}
                  onChange={(event) => onDraftChange({ ...draft, title: event.target.value })}
                  placeholder="e.g. LED street lighting conversion"
                  required
                />
              </label>

              <div className="grid gap-5 pt-1 sm:grid-cols-2">
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  Sector
                  <Select
                    name="sector"
                    className="mt-2"
                    value={draft.sector}
                    onChange={(event) => onDraftChange({ ...draft, sector: event.target.value as Sector })}
                    required
                  >
                    <option value="" disabled>
                      Select sector
                    </option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sectorLabels[sector]}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  Status
                  <Select
                    name="status"
                    className="mt-2"
                    value={draft.status}
                    onChange={(event) => onDraftChange({ ...draft, status: event.target.value as ActionStatus })}
                    required
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    {actionStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>

              <div className="grid gap-5 pt-1 sm:grid-cols-2">
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  Annual CO2 reduction
                  <Input
                    name="annualReduction"
                    type="number"
                    min={0}
                    value={draft.annualReduction}
                    onChange={(event) => onDraftChange({ ...draft, annualReduction: event.target.value === "" ? "" : Number(event.target.value) })}
                    placeholder="e.g. 9500"
                    required
                  />
                </label>
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  Start year
                  <Select
                    name="startYear"
                    className="mt-2"
                    value={String(draft.startYear)}
                    onChange={(event) => onDraftChange({ ...draft, startYear: event.target.value === "" ? "" : Number(event.target.value) })}
                    required
                  >
                    <option value="" disabled>
                      Select year
                    </option>
                    {startYearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                <Plus className="h-4 w-4" aria-hidden />
                {draft.id ? "Update action" : "Save action"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

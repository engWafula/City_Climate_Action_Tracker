"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { CheckCircle2, FileText, MoreHorizontal, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { deleteClimateAction, upsertClimateAction } from "@/app/actions/city-actions";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sectorLabels, statusLabels } from "@/lib/labels";
import { actionStatuses, sectors, type ActionStatus, type ClimateAction, type Sector } from "@/lib/types";
import { formatTons } from "@/lib/utils";

type DraftAction = {
  id?: string;
  title: string;
  sector: Sector | "";
  annualReduction: number | "";
  status: ActionStatus | "";
  startYear: number | "";
};

type Toast = {
  id: number;
  message: string;
};

const emptyDraft: DraftAction = {
  title: "",
  sector: "",
  annualReduction: "",
  status: "",
  startYear: ""
};

const statusTones: Record<ActionStatus, "green" | "blue" | "slate"> = {
  planned: "slate",
  in_progress: "blue",
  completed: "green"
};

export function AdminActionManager({ cityId, cityName, actions }: { cityId: string; cityName: string; actions: ClimateAction[] }) {
  const [draft, setDraft] = useState<DraftAction>(emptyDraft);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [actionToDelete, setActionToDelete] = useState<ClimateAction | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const saveAction = upsertClimateAction.bind(null, cityId);

  function showToast(message: string) {
    const id = Date.now();

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ id, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((currentToast) => (currentToast?.id === id ? null : currentToast));
    }, 3500);
  }

  function openAddModal() {
    setDraft(emptyDraft);
    setText("");
    setMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(action: ClimateAction) {
    setOpenActionMenuId(null);
    setDraft(action);
    setText("");
    setMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setDraft(emptyDraft);
    setText("");
    setMessage("");
  }

  function toggleActionMenu(actionId: string) {
    setOpenActionMenuId((currentId) => (currentId === actionId ? null : actionId));
  }

  function requestDelete(action: ClimateAction) {
    setOpenActionMenuId(null);
    setActionToDelete(action);
  }

  function confirmDelete() {
    if (!actionToDelete) {
      return;
    }

    const deletedActionTitle = actionToDelete.title;

    startDeleteTransition(async () => {
      try {
        await deleteClimateAction(cityId, actionToDelete.id);
        setActionToDelete(null);
        showToast(`Deleted “${deletedActionTitle}”.`);
      } catch {
        setMessage("Could not delete the action. Try again.");
      }
    });
  }

  async function importFromText() {
    setMessage("");
    if (text.trim().length < 30) {
      setMessage("Paste at least a sentence or two about the action.");
      return;
    }

    setIsImporting(true);
    try {
      const response = await fetch("/api/import-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        setMessage(response.status === 401 ? "Sign in again to import actions." : "Could not parse that text. Try adding a year, sector, and CO2 estimate.");
        return;
      }

      const imported = (await response.json()) as DraftAction;
      setDraft(imported);
      setMessage("Imported into the draft. Review it, then save.");
    } catch {
      setMessage("Import failed. Check your connection and try again.");
    } finally {
      setIsImporting(false);
    }
  }

  const columns = useMemo<DataTableColumn<ClimateAction>[]>(
    () => [
      {
        key: "title",
        header: "Action",
        className: "px-4 py-3 text-slate-700",
        cell: (action) => (
          <div>
            <p className="font-medium text-slate-950">{action.title}</p>
            <p className="mt-1 text-xs text-slate-500">{sectorLabels[action.sector]}</p>
          </div>
        )
      },
      {
        key: "city",
        header: "City",
        className: "px-4 py-3 text-slate-600",
        cell: () => cityName
      },
      {
        key: "reduction",
        header: "Annual CO2 reduction",
        className: "px-4 py-3 text-slate-600",
        cell: (action) => `${formatTons(action.annualReduction)} tons/year`
      },
      {
        key: "status",
        header: "Status",
        className: "px-4 py-3 text-slate-600",
        cell: (action) => <Badge tone={statusTones[action.status]}>{statusLabels[action.status]}</Badge>
      },
      {
        key: "startYear",
        header: "Start year",
        className: "px-4 py-3 text-slate-600",
        cell: (action) => action.startYear
      },
      {
        key: "actions",
        header: "",
        className: "px-4 py-3 text-right",
        cell: (action) => (
          <div className="relative flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Open actions menu for ${action.title}`}
              aria-expanded={openActionMenuId === action.id}
              onClick={() => toggleActionMenu(action.id)}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </Button>
            {openActionMenuId === action.id ? (
              <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-md border border-slate-200 bg-white py-1 text-left shadow-lg">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => openEditModal(action)}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  Edit
                </button>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                  onClick={() => requestDelete(action)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        )
      }
    ],
    [cityName, openActionMenuId]
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Actions data table</CardTitle>
            <CardDescription>View, search, add, edit, or remove climate actions for {cityName}.</CardDescription>
          </div>
          <Button type="button" onClick={openAddModal}>
            <Plus className="h-4 w-4" aria-hidden />
            Add action
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            rows={actions}
            columns={columns}
            getRowId={(action) => action.id}
            getSearchText={(action) =>
              [action.title, cityName, sectorLabels[action.sector], statusLabels[action.status], action.annualReduction, action.startYear].join(" ")
            }
            searchPlaceholder="Search actions by title, city, sector, status, reduction, or year..."
            emptyMessage="No actions match your search."
            initialPageSize={8}
          />
        </CardContent>
      </Card>

      {isModalOpen ? (
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
              <Button type="button" variant="ghost" size="icon" aria-label="Close action modal" onClick={closeModal}>
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>

            <div className="grid flex-1 gap-6 overflow-y-auto px-7 py-7 lg:grid-cols-[0.75fr_1.25fr]">
              <aside className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
                <header className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <FileText className="h-4 w-4 text-emerald-700" aria-hidden />
                    Import from free text
                  </div>
                  <p className="text-sm text-slate-500">Paste policy notes to fill the draft fields.</p>
                </header>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Source text
                  <Textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="The city council approved a $2M investment to convert all street lighting to LED by 2027..."
                    className="min-h-56 bg-white"
                  />
                </label>
                <div className="space-y-3">
                  <Button type="button" variant="secondary" className="w-full" onClick={() => void importFromText()} disabled={isImporting}>
                    <Sparkles className="h-4 w-4" aria-hidden />
                    {isImporting ? "Extracting..." : "Extract action"}
                  </Button>
                  {message ? <p className="text-sm text-slate-500">{message}</p> : null}
                </div>
              </aside>

              <form
                action={(formData) => {
                  const actionTitle = draft.title;
                  const isEditing = Boolean(draft.id);

                  startTransition(async () => {
                    try {
                      await saveAction(formData);
                      closeModal();
                      showToast(isEditing ? `Updated “${actionTitle}”.` : `Added “${actionTitle}”.`);
                    } catch {
                      setMessage("Could not save the action. Check the fields and try again.");
                    }
                  });
                }}
                className="flex min-h-full flex-col"
              >
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
                      onChange={(event) => setDraft({ ...draft, title: event.target.value })}
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
                        onChange={(event) => setDraft({ ...draft, sector: event.target.value as Sector })}
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
                        onChange={(event) => setDraft({ ...draft, status: event.target.value as ActionStatus })}
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
                        onChange={(event) => setDraft({ ...draft, annualReduction: event.target.value === "" ? "" : Number(event.target.value) })}
                        placeholder="e.g. 9500"
                        required
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-medium text-slate-700">
                      Start year
                      <Input
                        name="startYear"
                        type="number"
                        min={1990}
                        max={2100}
                        value={draft.startYear}
                        onChange={(event) => setDraft({ ...draft, startYear: event.target.value === "" ? "" : Number(event.target.value) })}
                        placeholder="e.g. 2027"
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                  <Button type="button" variant="ghost" onClick={closeModal}>
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
      ) : null}

      {actionToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="delete-action-title">
            <div className="space-y-2 border-b border-slate-200 px-6 py-5">
              <h2 id="delete-action-title" className="text-lg font-semibold text-slate-950">
                Delete action?
              </h2>
              <p className="text-sm text-slate-500">This will permanently remove “{actionToDelete.title}” from {cityName}.</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-5">
              <Button type="button" variant="ghost" onClick={() => setActionToDelete(null)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4" aria-hidden />
                {isDeleting ? "Deleting..." : "Delete action"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed right-6 top-6 z-[60] flex max-w-sm items-start gap-3 rounded-md border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg" role="status" aria-live="polite">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
          <p className="font-medium text-slate-900">{toast.message}</p>
        </div>
      ) : null}
    </>
  );
}

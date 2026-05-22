"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteClimateAction, upsertClimateAction } from "@/app/actions/city-actions";
import { AdminActionDeleteDialog } from "@/components/admin-action-delete-dialog";
import { AdminActionFormDialog } from "@/components/admin-action-form-dialog";
import { AdminActionToast, type Toast } from "@/components/admin-action-toast";
import { emptyDraft, type DraftAction } from "@/components/admin-action-types";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sectorLabels, statusLabels } from "@/lib/labels";
import type { ActionStatus, ClimateAction } from "@/lib/types";
import { formatTons } from "@/lib/utils";

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
        <AdminActionFormDialog
          cityName={cityName}
          draft={draft}
          text={text}
          message={message}
          isImporting={isImporting}
          isPending={isPending}
          onClose={closeModal}
          onDraftChange={setDraft}
          onTextChange={setText}
          onImport={() => void importFromText()}
          onSubmit={(formData) => {
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
        />
      ) : null}

      <AdminActionDeleteDialog
        action={actionToDelete}
        cityName={cityName}
        isDeleting={isDeleting}
        onCancel={() => setActionToDelete(null)}
        onConfirm={confirmDelete}
      />

      <AdminActionToast toast={toast} />
    </>
  );
}

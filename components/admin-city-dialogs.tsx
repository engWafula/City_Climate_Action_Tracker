"use client";

import { useTransition } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { createCity, updateCitySettings } from "@/app/actions/city-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CityWithActions } from "@/lib/types";

export function AddCityDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="add-city-title">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="add-city-title" className="text-xl font-semibold text-slate-950">
              Add city
            </h2>
            <p className="mt-1 text-sm text-slate-500">Create a city workspace with baseline and target assumptions.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close add city dialog" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <form
          action={(formData) => {
            startTransition(async () => {
              await createCity(formData);
            });
          }}
          className="space-y-5 px-6 py-5"
        >
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            City name
            <Input name="name" placeholder="e.g. Lakeside" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Baseline CO2 tons
              <Input name="baselineEmissions" type="number" min={1} placeholder="500000" required />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Net-zero target
              <Input name="targetYear" type="number" min={new Date().getFullYear()} max={2100} placeholder="2035" required />
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Plus className="h-4 w-4" aria-hidden />
              {isPending ? "Adding..." : "Add city"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditCityDialog({ city, isOpen, onClose }: { city: CityWithActions; isOpen: boolean; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const updateSelectedCity = updateCitySettings.bind(null, city.id);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-city-title">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="edit-city-title" className="text-xl font-semibold text-slate-950">
              Edit {city.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Update the assumptions used for this city dashboard.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close edit city dialog" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <form
          action={(formData) => {
            startTransition(async () => {
              await updateSelectedCity(formData);
              onClose();
            });
          }}
          className="space-y-5 px-6 py-5"
        >
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            City name
            <Input name="name" defaultValue={city.name} required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Baseline CO2 tons
              <Input name="baselineEmissions" type="number" min={1} defaultValue={city.baselineEmissions} required />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Net-zero target
              <Input name="targetYear" type="number" min={new Date().getFullYear()} max={2100} defaultValue={city.targetYear} required />
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Pencil className="h-4 w-4" aria-hidden />
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

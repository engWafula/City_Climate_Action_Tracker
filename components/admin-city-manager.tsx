"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Building2, Pencil, Plus, X } from "lucide-react";
import { createCity, updateCitySettings } from "@/app/actions/city-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CityWithActions } from "@/lib/types";
import { cn, formatTons } from "@/lib/utils";

type CitySummary = {
  id: string;
  name: string;
  baselineEmissions: number;
  targetYear: number;
  _count: {
    actions: number;
  };
};

export function AdminCityManager({ cities, selectedCity }: { cities: CitySummary[]; selectedCity: CityWithActions }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const selectedCityId = selectedCity.id;
  const updateSelectedCity = updateCitySettings.bind(null, selectedCityId);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>City workspace</CardTitle>
            <CardDescription>Select a city, update its baseline assumptions, or add another city to the tracker.</CardDescription>
          </div>
          <Button type="button" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Add city
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase text-slate-500">Cities</h3>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{cities.length}</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {cities.map((city) => {
                const isSelected = city.id === selectedCityId;

                return (
                  <Link
                    key={city.id}
                    href={`/admin?cityId=${city.id}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 border-b border-slate-200 px-4 py-3 text-left transition-colors last:border-b-0",
                      isSelected ? "bg-emerald-50" : "hover:bg-slate-50"
                    )}
                    aria-current={isSelected ? "page" : undefined}
                  >
                    <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md", isSelected ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500")}>
                      <Building2 className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block truncate text-sm font-semibold", isSelected ? "text-emerald-950" : "text-slate-950")}>{city.name}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {city._count.actions} action{city._count.actions === 1 ? "" : "s"} · target {city.targetYear}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </aside>

          <section className="space-y-5">
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-emerald-700">Selected city</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-950">{selectedCity.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatTons(selectedCity.baselineEmissions)} baseline tons · {selectedCity.actions.length} action
                  {selectedCity.actions.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="h-4 w-4" aria-hidden />
                  Edit city
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Baseline</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{formatTons(selectedCity.baselineEmissions)}</p>
                <p className="text-xs text-slate-500">CO2 tons/year</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Target year</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{selectedCity.targetYear}</p>
                <p className="text-xs text-slate-500">Net-zero goal</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Actions</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{selectedCity.actions.length}</p>
                <p className="text-xs text-slate-500">Tracked initiatives</p>
              </div>
            </div>
          </section>
        </div>

        {isAddDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="add-city-title">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 id="add-city-title" className="text-xl font-semibold text-slate-950">
                    Add city
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Create a city workspace with baseline and target assumptions.</p>
                </div>
                <Button type="button" variant="ghost" size="icon" aria-label="Close add city dialog" onClick={() => setIsAddDialogOpen(false)}>
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
                  <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
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
        ) : null}

        {isEditDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-city-title">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 id="edit-city-title" className="text-xl font-semibold text-slate-950">
                    Edit {selectedCity.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Update the assumptions used for this city dashboard.</p>
                </div>
                <Button type="button" variant="ghost" size="icon" aria-label="Close edit city dialog" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <form
                action={(formData) => {
                  startTransition(async () => {
                    await updateSelectedCity(formData);
                    setIsEditDialogOpen(false);
                  });
                }}
                className="space-y-5 px-6 py-5"
              >
                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  City name
                  <Input name="name" defaultValue={selectedCity.name} required />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2 text-sm font-medium text-slate-700">
                    Baseline CO2 tons
                    <Input name="baselineEmissions" type="number" min={1} defaultValue={selectedCity.baselineEmissions} required />
                  </label>
                  <label className="block space-y-2 text-sm font-medium text-slate-700">
                    Net-zero target
                    <Input name="targetYear" type="number" min={new Date().getFullYear()} max={2100} defaultValue={selectedCity.targetYear} required />
                  </label>
                </div>
                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                  <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
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
        ) : null}
      </CardContent>
    </Card>
  );
}

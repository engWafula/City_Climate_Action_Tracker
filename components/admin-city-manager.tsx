"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Pencil, Plus } from "lucide-react";
import { AddCityDialog, EditCityDialog } from "@/components/admin-city-dialogs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { CityWithActions } from "@/lib/types";
import { formatTons } from "@/lib/utils";

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
  const router = useRouter();
  const selectedCityId = selectedCity.id;

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
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              City
              <Select value={selectedCityId} onChange={(event) => router.push(`/admin?cityId=${event.target.value}`)} aria-label="Select city to manage">
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city._count.actions} action{city._count.actions === 1 ? "" : "s"}, target {city.targetYear})
                  </option>
                ))}
              </Select>
            </label>
            <div className="flex items-center gap-2 text-sm text-slate-500 md:pb-2">
              <Building2 className="h-4 w-4 text-emerald-700" aria-hidden />
              <span>
                {cities.length} configured cit{cities.length === 1 ? "y" : "ies"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr]">
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

        <AddCityDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} />
        <EditCityDialog city={selectedCity} isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} />
      </CardContent>
    </Card>
  );
}

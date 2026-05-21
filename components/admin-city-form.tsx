import { updateCitySettings } from "@/app/actions/city-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CityWithActions } from "@/lib/types";

export function AdminCityForm({ city }: { city: CityWithActions }) {
  const action = updateCitySettings.bind(null, city.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>City settings</CardTitle>
        <CardDescription>Set the baseline and target used across the public tracker.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            City
            <Input name="name" defaultValue={city.name} />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Baseline CO2 tons
            <Input name="baselineEmissions" type="number" min={1} defaultValue={city.baselineEmissions} />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Net-zero target
            <Input name="targetYear" type="number" min={new Date().getFullYear()} defaultValue={city.targetYear} />
          </label>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}

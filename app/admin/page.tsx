import { AppShell } from "@/components/app-shell";
import { AdminActionManager } from "@/components/admin-action-manager";
import { AdminCityForm } from "@/components/admin-city-form";
import { requireAdmin } from "@/lib/auth";
import { getPrimaryCity } from "@/lib/city-repository";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  const city = await getPrimaryCity();

  return (
    <AppShell>
      <section className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">City admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Manage {city.name}</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Update baseline assumptions, maintain climate actions, and import structured actions from policy text.
        </p>
      </section>

      <div className="space-y-6">
        <AdminCityForm city={city} />
        <AdminActionManager cityId={city.id} cityName={city.name} actions={city.actions} />
      </div>
    </AppShell>
  );
}

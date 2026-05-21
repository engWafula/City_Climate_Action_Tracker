import { AppShell } from "@/components/app-shell";
import { AdminActionManager } from "@/components/admin-action-manager";
import { AdminCityManager } from "@/components/admin-city-manager";
import { requireAdmin } from "@/lib/auth";
import { getCities, getCityByIdOrPrimary } from "@/lib/city-repository";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<{ cityId?: string | string[] }>;

function getCityId(searchParams?: { cityId?: string | string[] }) {
  return Array.isArray(searchParams?.cityId) ? searchParams.cityId[0] : searchParams?.cityId;
}

export default async function AdminPage({ searchParams }: { searchParams: PageSearchParams }) {
  await requireAdmin();

  const params = await searchParams;
  const city = await getCityByIdOrPrimary(getCityId(params));
  const cities = await getCities();

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
        <AdminCityManager cities={cities} selectedCity={city} />
        <AdminActionManager cityId={city.id} cityName={city.name} actions={city.actions} />
      </div>
    </AppShell>
  );
}

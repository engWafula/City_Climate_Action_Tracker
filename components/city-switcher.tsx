"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";

type CityOption = {
  id: string;
  name: string;
};

export function CitySwitcher({
  cities,
  selectedCityId,
  basePath = "/"
}: {
  cities: CityOption[];
  selectedCityId: string;
  basePath?: "/" | "/admin";
}) {
  const router = useRouter();

  if (cities.length <= 1) {
    return null;
  }

  return (
    <label className="block min-w-56 space-y-2 text-left text-sm font-medium text-slate-700">
      City
      <Select
        value={selectedCityId}
        onChange={(event) => {
          router.push(`${basePath}?cityId=${event.target.value}`);
        }}
        aria-label="Select city"
      >
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </Select>
    </label>
  );
}

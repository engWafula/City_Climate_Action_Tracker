"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTons } from "@/lib/utils";
import type { ProjectionPoint } from "@/lib/types";

export function ProjectionChartClient({ data }: { data: ProjectionPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projected emissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="emissions" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="year" stroke="#64748b" tickLine={false} />
              <YAxis stroke="#64748b" tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false} width={56} />
              <Tooltip formatter={(value) => [`${formatTons(Number(value))} tons`, "Projected emissions"]} />
              <Area type="monotone" dataKey="emissions" stroke="#047857" strokeWidth={2} fill="url(#emissions)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

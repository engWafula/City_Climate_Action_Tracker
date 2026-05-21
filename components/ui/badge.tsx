import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "green" | "red" | "blue" | "slate" | "amber";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200"
};

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1", tones[tone], className)}
      {...props}
    />
  );
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { getPageCount, getPageRange } from "@/lib/pagination";

export function PaginationControls({
  page,
  pageSize,
  totalItems,
  itemLabel = "actions",
  pageSizeOptions = [5, 10, 20],
  onPageChange,
  onPageSizeChange
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  itemLabel?: string;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const pageCount = getPageCount(totalItems, pageSize);
  const range = getPageRange({ page, pageSize, totalItems });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      <div>
        {totalItems === 0 ? (
          `No ${itemLabel}`
        ) : (
          <>
            Showing {range.start + 1}-{range.end} of {totalItems}
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          Rows
          <Select className="h-8 w-20" value={String(pageSize)} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        <span>
          Page {page} of {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

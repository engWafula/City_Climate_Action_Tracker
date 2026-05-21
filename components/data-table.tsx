"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PaginationControls } from "@/components/pagination-controls";
import { Input } from "@/components/ui/input";
import { clampPage, filterItems, paginateItems } from "@/lib/pagination";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  getSearchText,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  initialPageSize = 5
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  getSearchText: (row: T) => string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  initialPageSize?: number;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const filteredRows = useMemo(() => filterItems(rows, query, getSearchText), [rows, query, getSearchText]);
  const safePage = clampPage(page, filteredRows.length, pageSize);
  const visibleRows = useMemo(() => paginateItems(filteredRows, safePage, pageSize), [filteredRows, safePage, pageSize]);

  function handleSearchChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <label className="relative block max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input className="pl-9" value={query} onChange={(event) => handleSearchChange(event.target.value)} placeholder={searchPlaceholder} />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.className ?? "px-4 py-3 font-semibold"}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {visibleRows.map((row) => (
              <tr key={getRowId(row)} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className={column.className ?? "px-4 py-3 text-slate-600"}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
            {visibleRows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <PaginationControls
        page={safePage}
        pageSize={pageSize}
        totalItems={filteredRows.length}
        itemLabel="results"
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export type PaginationState = {
  page: number;
  pageSize: number;
  totalItems: number;
};

export function getPageCount(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function clampPage(page: number, totalItems: number, pageSize: number) {
  return Math.min(Math.max(1, page), getPageCount(totalItems, pageSize));
}

export function getPageRange({ page, pageSize, totalItems }: PaginationState) {
  if (totalItems === 0) {
    return { start: 0, end: 0 };
  }

  const safePage = clampPage(page, totalItems, pageSize);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, totalItems);

  return { start, end };
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const { start, end } = getPageRange({ page, pageSize, totalItems: items.length });
  return items.slice(start, end);
}

export function filterItems<T>(items: T[], query: string, getSearchText: (item: T) => string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => getSearchText(item).toLowerCase().includes(normalizedQuery));
}

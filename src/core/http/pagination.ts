export interface CollectionQuery {
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
}

export interface CollectionPage<Item> {
  items: Item[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
  };
}

interface QueryCollectionOptions<Item> {
  query: CollectionQuery;
  searchFields: readonly ((item: Item) => string)[];
  sortFields: Readonly<Record<string, (item: Item) => string>>;
  filter?: (item: Item) => boolean;
}

export function queryCollection<Item>(
  source: readonly Item[],
  options: QueryCollectionOptions<Item>,
): CollectionPage<Item> {
  const { query } = options;
  const searchTerm = query.search?.trim().toLocaleLowerCase("fr");
  let items = source.filter((item) => options.filter?.(item) ?? true);

  if (searchTerm) {
    items = items.filter((item) =>
      options.searchFields
        .map((getValue) => getValue(item))
        .join(" ")
        .toLocaleLowerCase("fr")
        .includes(searchTerm),
    );
  }

  const sort = query.sort;
  if (sort) {
    const descending = sort.startsWith("-");
    const field = descending ? sort.slice(1) : sort;
    const getValue = options.sortFields[field];

    if (getValue) {
      items = [...items].sort((first, second) => {
        const comparison = getValue(first).localeCompare(getValue(second), "fr", { numeric: true });
        return descending ? -comparison : comparison;
      });
    }
  }

  const page = Number(query.page ?? "1");
  const limit = Number(query.limit ?? "20");
  const total = items.length;
  const offset = (page - 1) * limit;
  const pageItems = items.slice(offset, offset + limit);

  return {
    items: pageItems,
    pagination: {
      total,
      page,
      limit,
      hasNext: offset + limit < total,
    },
  };
}

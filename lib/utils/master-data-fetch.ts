import { GridFilterModel, GridPaginationModel, GridSortItem, GridValidRowModel } from '@mui/x-data-grid';

interface FetchOptions {
  endpoint: string;
  filters: GridFilterModel;
  sort: GridSortItem[];
  pagination: GridPaginationModel;
}

interface FetchResult<T extends GridValidRowModel> {
  data: T[];
  total: number;
  error?: string;
}

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchMasterData<T extends GridValidRowModel>({
  endpoint,
  filters,
  sort,
  pagination,
}: FetchOptions): Promise<FetchResult<T>> {
  try {
    const cacheKey = JSON.stringify({ endpoint, filters, sort, pagination });
    const cachedData = cache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data as FetchResult<T>;
    }

    const queryParams = new URLSearchParams({
      page: String(pagination.page + 1),
      pageSize: String(pagination.pageSize),
      ...(sort[0] && {
        sortField: sort[0].field,
        sortOrder: sort[0].sort || 'asc',
      }),
      ...(filters.items.length > 0 && {
        filters: JSON.stringify(filters.items),
      }),
      ...(filters.quickFilterValues && filters.quickFilterValues.length > 0 && {
        quickFilter: filters.quickFilterValues.join(' '),
      }),
    });

    const response = await fetch(`/api/${endpoint}?${queryParams}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json() as FetchResult<T>;

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export function clearQueryCache() {
  cache.clear();
} 
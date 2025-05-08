import { createClient } from "../supabase/client";
import dotenv from "dotenv";
import { cache } from "react";

dotenv.config();

const supabase = createClient();

// Cache the column keys to avoid recreating the array on every call
const COLUMN_KEYS = [
  "id",
  "first_name",
  "last_name",
  "date_of_birth",
  "email",
  "role_profile",
  "race_ethnicity",
  "state_work",
  "district_id",
  "school_id",
] as const;

export type ColumnKey = typeof COLUMN_KEYS[number];

export interface ColumnConditions {
  column: number;
  conditions: {
    name?: "contains" | "eq" | "gt" | "lt";
    args: any[];
  }[];
}

export interface FetchFilteredDataParams {
  filters?: ColumnConditions[];
  sortColumn?: string | null;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface FetchFilteredDataResult {
  data: any[];
  totalCount: number;
  error?: string;
}

const getColumnKey = (columnIndex: number): ColumnKey | "" => {
  return COLUMN_KEYS[columnIndex] || "";
};

// Cache the query results for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const queryCache = new Map<string, { data: any; timestamp: number }>();

const generateCacheKey = (params: FetchFilteredDataParams): string => {
  return JSON.stringify(params);
};

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

export const fetchFilteredData = async ({
  filters = [],
  sortColumn = null,
  sortOrder = "asc",
  page = 1,
  pageSize = 10,
}: FetchFilteredDataParams): Promise<FetchFilteredDataResult> => {
  try {
    // Check cache first
    const cacheKey = generateCacheKey({ filters, sortColumn, sortOrder, page, pageSize });
    const cachedResult = queryCache.get(cacheKey);
    
    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      return cachedResult.data;
    }

    let query = supabase.from("people").select("*", { count: "exact" });

    // Apply filters
    filters.forEach(({ column, conditions }) => {
      const columnName = getColumnKey(column);
      if (!columnName) return;

      conditions.forEach(({ name, args }) => {
        if (!name || args.length === 0) return;

        switch (name) {
          case "contains":
            query = query.ilike(columnName, `%${args[0]}%`);
            break;
          case "eq":
            query = query.eq(columnName, args[0]);
            break;
          case "gt":
            query = query.gt(columnName, args[0]);
            break;
          case "lt":
            query = query.lt(columnName, args[0]);
            break;
        }
      });
    });

    // Apply sorting
    if (sortColumn && COLUMN_KEYS.includes(sortColumn as ColumnKey)) {
      query = query.order(sortColumn, { ascending: sortOrder === "asc" });
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const result = {
      data: data || [],
      totalCount: count ?? 0,
    };

    // Cache the result
    queryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (error) {
    console.error("Error in fetchFilteredData:", error);
    return {
      data: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

// Clear cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of queryCache.entries()) {
    if (!isCacheValid(value.timestamp)) {
      queryCache.delete(key);
    }
  }
}, CACHE_DURATION);

// Export a function to manually clear the cache if needed
export const clearQueryCache = () => {
  queryCache.clear();
};

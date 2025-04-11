import { createClient } from "../supabase/client";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient();

export const fetchData = async () => {
  const { data, error } = await supabase.from("people").select("*");
  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  console.log("Data:", data);
  return data;
};

export interface ColumnConditions {
  column: number;
  conditions: {
    name?: string;
    args: any[];
  }[];
}

const getColumnKey = (columnIndex: number): string => {
  const columnKeys = [
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
  ];
  return columnKeys[columnIndex] || ""; // Fallback to empty string if index is out of bounds
};

export const fetchFilteredData = async ({
  filters = [],
  sortColumn = null,
  sortOrder = "asc",
  page = 1,
  pageSize = 10,
}: {
  filters?: ColumnConditions[];
  sortColumn?: string | null;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) => {
  // put all the filter into the query itself and then fetch the data
  // setup all filters before and make one call to the database
  // filter w/ empty or *

  let query = supabase.from("people").select("*", { count: "exact" }); // Fetch total count

  // Apply filters
  filters.forEach(({ column, conditions }) => {
    const columnName = getColumnKey(column);
    console.log("Applying filter on column:", columnName);
    conditions.forEach(({ name, args }) => {
      console.log("Filter condition:", { name, args });
      if (!name || args.length === 0) return;

      if (name === "contains") query = query.ilike(columnName, `%${args[0]}%`);
      if (name === "eq") query = query.eq(columnName, args[0]);
      if (name === "gt") query = query.gt(columnName, args[0]);
      if (name === "lt") query = query.lt(columnName, args[0]);
    });
  });

  // Apply sorting FIRST before pagination
  if (sortColumn !== null) {
    const columnName = sortColumn;
    if (columnName) {
      console.log("Sorting by column:", columnName, "Order:", sortOrder);
      query = query.order(columnName, { ascending: sortOrder === "asc" });
    } else {
      console.warn("Invalid sort column:", sortColumn);
    }
  }

  // Apply pagination AFTER sorting
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  console.log("Pagination range:", { from, to });
  query = query.range(from, to);

  // Fetch data
  const { data, error, count } = await query;
  console.log("Final query result:", { data, error, count });

  if (error) {
    console.error("Error fetching data:", error);
    return { data: [], totalCount: 0 };
  }

  return { data, totalCount: count ?? 0 };
};

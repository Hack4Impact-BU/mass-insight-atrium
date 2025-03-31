import { useEffect, useState } from "react";
import { HotTable } from "@handsontable/react-wrapper";
import "handsontable/dist/handsontable.full.min.css";
import type { Config } from "handsontable/plugins/columnSorting";

import { registerAllModules } from "handsontable/registry";
import { fetchFilteredData } from "@/utils/upload-data/master-data-fetch";
import type { ColumnConditions } from "@/utils/upload-data/master-data-fetch";

registerAllModules();

const PeopleTable = () => {
  interface Person {
    first_name: string;
    last_name: string;
    id: number;
    date_of_birth: string | null;
    email: string | null;
    role_profile: string | null;
    race_ethnicity: string | null;
    state_work: string | null;
    district_id: number | null;
    school_id: number | null;
  }

  const [people, setPeople] = useState<Person[]>([]);
  const [filters, setFilters] = useState<ColumnConditions[]>([]);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch data with filters, sorting, and pagination
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, totalCount } = await fetchFilteredData({
        filters,
        sortColumn,
        sortOrder,
        page,
        pageSize,
      });
      setPeople(data);
      setTotalCount(totalCount);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters, sorting, or pagination change
  useEffect(() => {
    fetchData();
  }, [filters, sortColumn, sortOrder, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Define column headers dynamically
  const columns = people.length > 0 ? Object.keys(people[0]) : [];
  const columnSettings = columns.map((key) => ({
    data: key,
    title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
    width: 150,
  }));

  return (
    <div className="flex flex-col items-center gap-6 mt-10">
      {/* Pagination Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="p-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page >= totalPages}
          className="p-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Handsontable Component */}
      <div className="overflow-auto border border-gray-300 rounded-lg w-full">
        <HotTable
          data={people}
          colHeaders={columns}
          columns={columnSettings}
          rowHeaders={true}
          dropdownMenu={[
            "filter_by_condition",
            "filter_by_value",
            "filter_action_bar",
          ]}
          columnSorting={true} // Enable sorting UI
          filters={true}
          stretchH="all"
          licenseKey="non-commercial-and-evaluation"
          width="1400"
          height="600px"
          afterFilter={(conditions) => setFilters(conditions)}
          afterColumnSort={(
            currentSortConfig: Config[], // Previous sorting state
            destinationSortConfigs: Config[] // Updated sorting state
          ) => {
            console.log("Before sorting:", currentSortConfig);
            console.log("After sorting:", destinationSortConfigs);

            if (destinationSortConfigs.length > 0) {
              setSortColumn(destinationSortConfigs[0].column);
              setSortOrder(destinationSortConfigs[0].sortOrder || "asc");
            } else {
              setSortColumn(null);
              setSortOrder("asc");
            }
          }}
        />
      </div>

      {/* Loading Indicator */}
      {loading && <p className="mt-4">Loading data...</p>}
    </div>
  );
};

export default PeopleTable;

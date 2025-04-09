import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid";
import { fetchFilteredData } from "@/utils/upload-data/master-data-fetch";
import type { ColumnConditions } from "@/utils/upload-data/master-data-fetch";

const PeopleTable = () => {
  interface Person {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    email: string | null;
    role_profile: string | null;
    race_ethnicity: string | null;
    state_work: string | null;
    district_id: number | null;
    school_id: number | null;
  }

  const [people, setPeople] = useState<Person[]>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // Changed to useState
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch data with filters, sorting, and pagination
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Sort model:", sortModel);
      const sortColumn = sortModel[0]?.field || "id"; // Default to "id" if no sort is applied
      const sortOrder = sortModel[0]?.sort || "asc"; // Default to ascending order
      const { data, totalCount } = await fetchFilteredData({
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
  }, [sortModel, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Define column headers dynamically
  const columns: GridColDef[] =
    people.length > 0
      ? Object.keys(people[0]).map((key) => ({
          field: key,
          headerName:
            key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
          width: 150,
          sortable: true,
        }))
      : [];

  return (
    <div className="flex flex-col items-center gap-6 mt-5">
      {/* Material UI DataGrid Component */}
      <div className="w-full h-[600px] border border-gray-300 rounded-lg">
        <DataGrid
          rows={people}
          columns={columns}
          rowCount={totalCount}
          initialState={{
            pagination: {
              paginationModel: { pageSize: pageSize, page: page - 1 },
            },
          }}
          paginationModel={{ page: page - 1, pageSize }} // DataGrid uses 0-based indexing for pages
          paginationMode="server"
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(model) => setSortModel(model)}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1); // Convert to 1-based indexing
            setPageSize(model.pageSize); // Update pageSize dynamically
          }}
          loading={loading}
        />
      </div>
      {/* Loading Indicator */}
      {loading && <p className="mt-4">Loading data...</p>}
    </div>
  );
};

export default PeopleTable;

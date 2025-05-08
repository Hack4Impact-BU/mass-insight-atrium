'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
  GridToolbar,
  GridRowModel,
  GridPaginationModel,
  GridSortModel,
  GridFilterModel,
  GridLoadingOverlay,
  GridOverlay,
  GridRowParams
} from '@mui/x-data-grid';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { 
  setSelectedRow, 
  setEditMode, 
  setDeleteMode,
  setRefreshTrigger,
  setFilters,
  setSort,
  setPagination
} from '@/lib/features/masterTableSlice';
import type { MasterTableState } from '@/lib/features/masterTableSlice';
import { fetchMasterData } from '@/lib/utils/master-data-fetch';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';
import { useLoadingState } from '@/lib/hooks/useLoadingState';

interface MasterTableProps {
  endpoint: string;
  columns: GridColDef[];
  title?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  customToolbar?: React.ReactNode;
  getRowId?: (row: any) => string;
  initialState?: Partial<MasterTableState>;
}

const NoRowsOverlay = () => (
  <GridOverlay>
    <Typography variant="body1" color="text.secondary">
      No data available
    </Typography>
  </GridOverlay>
);

const ErrorOverlay = ({ message }: { message: string }) => (
  <GridOverlay>
    <Typography variant="body1" color="error">
      {message}
    </Typography>
  </GridOverlay>
);

const MasterTable = ({
  endpoint,
  columns,
  title,
  onEdit,
  onDelete,
  onRefresh,
  customToolbar,
  getRowId = (row) => row.id,
  initialState
}: MasterTableProps) => {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { handleError } = useErrorHandler();
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  // Get state from Redux store
  const {
    selectedRow,
    editMode,
    deleteMode,
    refreshTrigger,
    filters,
    sort,
    pagination
  } = useAppSelector((state) => state.masterTable);

  // Local state
  const [rows, setRows] = useState<GridRowModel[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Memoize debounced filters
  const debouncedFilters = useDebounce(filters, 300);

  // Memoize columns with actions
  const columnsWithActions = useMemo(() => {
    const actionColumn: GridColDef = {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(setSelectedRow(params.row.id));
                  dispatch(setEditMode(true));
                  onEdit(params.row.id);
                }}
                sx={{
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(setSelectedRow(params.row.id));
                  dispatch(setDeleteMode(true));
                  onDelete(params.row.id);
                }}
                sx={{
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    };

    return [...columns, actionColumn];
  }, [columns, onEdit, onDelete, theme, dispatch]);

  // Fetch data with error handling
  const fetchData = useCallback(async () => {
    try {
      startLoading();
      setError(null);
      
      const result = await fetchMasterData({
        endpoint,
        filters: debouncedFilters,
        sort,
        pagination,
      });

      setRows(result.data);
      setRowCount(result.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      handleError(err);
    } finally {
      stopLoading();
    }
  }, [endpoint, debouncedFilters, sort, pagination, startLoading, stopLoading, handleError]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  // Handle row click
  const handleRowClick = useCallback((params: GridRowParams) => {
    if (!editMode && !deleteMode) {
      router.push(`/${endpoint}/${params.row.id}`);
    }
  }, [editMode, deleteMode, router, endpoint]);

  // Handle filter change
  const handleFilterChange = useCallback((model: GridFilterModel) => {
    dispatch(setFilters(model));
  }, [dispatch]);

  // Handle sort change
  const handleSortChange = useCallback((model: GridSortModel) => {
    dispatch(setSort(model));
  }, [dispatch]);

  // Handle pagination change
  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    dispatch(setPagination(model));
  }, [dispatch]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    dispatch(setRefreshTrigger(Date.now()));
    onRefresh?.();
  }, [dispatch, onRefresh]);

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      {title && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {customToolbar}
        </Box>
      )}
      
      <DataGrid
        rows={rows}
        columns={columnsWithActions}
        getRowId={getRowId}
        rowCount={rowCount}
        loading={isLoading}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
        onRowClick={handleRowClick}
        onFilterModelChange={handleFilterChange}
        onSortModelChange={handleSortChange}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: pagination },
          filter: { filterModel: filters },
          sorting: { sortModel: sort },
        }}
        slots={{
          toolbar: GridToolbar,
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: GridLoadingOverlay,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 300 },
          },
        }}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
          },
        }}
      />
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: theme.palette.background.paper,
            padding: 2,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MasterTable;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GridFilterModel, GridPaginationModel, GridSortModel, GridSortItem } from '@mui/x-data-grid';

export interface MasterTableState {
  selectedRow: string | null;
  editMode: boolean;
  deleteMode: boolean;
  refreshTrigger: number;
  filters: GridFilterModel;
  sort: GridSortItem[];
  pagination: GridPaginationModel;
}

const initialState: MasterTableState = {
  selectedRow: null,
  editMode: false,
  deleteMode: false,
  refreshTrigger: 0,
  filters: {
    items: [],
    quickFilterValues: [],
  },
  sort: [],
  pagination: {
    page: 0,
    pageSize: 25,
  },
};

const masterTableSlice = createSlice({
  name: 'masterTable',
  initialState,
  reducers: {
    setSelectedRow: (state, action: PayloadAction<string | null>) => {
      state.selectedRow = action.payload;
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.editMode = action.payload;
    },
    setDeleteMode: (state, action: PayloadAction<boolean>) => {
      state.deleteMode = action.payload;
    },
    setRefreshTrigger: (state, action: PayloadAction<number>) => {
      state.refreshTrigger = action.payload;
    },
    setFilters: (state, action: PayloadAction<GridFilterModel>) => {
      state.filters = action.payload;
    },
    setSort: (state, action: PayloadAction<GridSortItem[]>) => {
      state.sort = action.payload;
    },
    setPagination: (state, action: PayloadAction<GridPaginationModel>) => {
      state.pagination = action.payload;
    },
  },
});

export const {
  setSelectedRow,
  setEditMode,
  setDeleteMode,
  setRefreshTrigger,
  setFilters,
  setSort,
  setPagination,
} = masterTableSlice.actions;

export default masterTableSlice.reducer; 
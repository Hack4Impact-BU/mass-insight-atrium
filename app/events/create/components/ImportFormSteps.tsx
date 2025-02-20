"use client";
import {
  Button,
  Checkbox,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { CloudUploadIcon } from "lucide-react";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from "react";
import Papa from "papaparse";
import {
  MaterialReactTable,
  MRT_RowSelectionState,
  useMaterialReactTable,
} from "material-react-table";
import { RowSelectionState } from "@tanstack/react-table";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export function ImportStep({
  next,
  setData,
}: {
  setData: (data: any) => void;
  next: () => void;
}) {
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      const inputFile = files[0];
      Papa.parse(inputFile, {
        header: true,
        complete: (results) => {
          setData(results.data);
          next();
        },
      });
    }
  };
  return (
    <>
      <h1 className="text-center text-3xl mb-5">Schedule your event</h1>
      <h2 className="text-center text-xl mb-5">
        Import a .csv file. If you have a xlsx file, convert to .csv first
        (Excel and Google Sheets allows you to save as CSV)
      </h2>
      <div className="flex items-center justify-center">
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload files
          <VisuallyHiddenInput
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e)}
            multiple
          />
        </Button>
      </div>
      <div className="mt-10 mb-2">
        <h3 className="text-center">NOTICE:</h3>
        <p className="text-center">
          Please format your invitee list appropriately with distinct data
          fields so that it may be imported more easily. Be sure to at least
          include the fields "First Name", "Last Name", or "Email", and "Id"
        </p>
      </div>
    </>
  );
}

const getColumns = (
  data: string[]
): { header: string; accessorKey: string }[] => {
  const columns: {
    header: string;
    accessorKey: string;
    filterVariant: string;
  }[] = [];
  if (data.length < 1) {
    return [];
  }
  const keys = Object.keys(data[0]);
  for (let i = 0; i < keys.length; i++) {
    columns.push({
      header: keys[i],
      accessorKey: keys[i],
      filterVariant: "text",
    });
  }
  return columns;
};
export function SelectStep({
  data,
  rowSelection,
  setRowSelection,
}: {
  data: any[];
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
}) {
  const columns = getColumns(data);
  const table = useMaterialReactTable({
    data,
    columns,
    enableRowSelection: true,
    enableBatchRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });
  console.log(rowSelection);
  return (
    <>
      <h1>Select the people that you want to invite:</h1>
      <MaterialReactTable table={table} />
    </>
  );
}

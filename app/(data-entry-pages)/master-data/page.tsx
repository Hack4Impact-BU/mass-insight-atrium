// app/view-data/page.tsx
"use client";

import { Typography, Button } from "@mui/material";
import MasterTable from "@/components/master-table";
import { GridColDef } from "@mui/x-data-grid";

// Define the columns for the people table
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'first_name', headerName: 'First Name', width: 130 },
  { field: 'last_name', headerName: 'Last Name', width: 130 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'phone', headerName: 'Phone', width: 130 },
  { field: 'created_at', headerName: 'Created At', width: 180, 
    valueFormatter: ({ value }) => 
      value ? new Date(value as string).toLocaleString() : '' },
  { field: 'updated_at', headerName: 'Updated At', width: 180,
    valueFormatter: ({ value }) => 
      value ? new Date(value as string).toLocaleString() : '' }
];

export default function ViewData() {
  return (
    <>
      {/* Needs to have navbar component added */}
      <>
        <div className="w-full bg-gray-100">
          <div className="flex flex-col items-center justify-between max-h-screen p-10 ">
            {/* Title Section */}
            <Typography variant="h4" className="font-extrabold mb-2">
              Master Data Spreadsheet
            </Typography>

            {/* Spreadsheet Section */}
            <div className="w-full max-w-7xl py-5">
              <MasterTable 
                endpoint="people"
                columns={columns}
                title="People"
              />
              {/* Navigation Buttons */}
              <div className="flex justify-between w-full mt-5">
                <Button className="text-blue-600" variant="outlined">
                  <a href="/upload-data">
                    <Typography className="normal-case p-3">Back</Typography>
                  </a>
                </Button>

                {/* <Button
                variant="contained"
                className="normal-case bg-blue-600 text-white px-6"
                disabled={!fileData}
                onClick={uploadSupabase}
              >
                <Typography className="normal-case p-3">Upload</Typography>
              </Button> */}
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );
}

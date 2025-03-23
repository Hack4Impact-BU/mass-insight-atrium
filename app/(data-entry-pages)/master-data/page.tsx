// app/view-data/page.tsx
"use client";

import { Typography, Button } from "@mui/material";
import PeopleTable from "@/components/master-table";

export default function ViewData() {
  return (
    <>
      {/* Needs to have navbar component added */}
      <>
        <div className="w-full">
          <div className="flex flex-col items-center justify-between min-h-screen py-10 bg-gray-100">
            {/* Title Section */}
            <Typography variant="h4" className="font-extrabold mb-2">
              Master Data Spreadsheet
            </Typography>

            {/* Spreadsheet Section */}
            <div className="w-full max-w-4xl">
              <PeopleTable />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between w-full max-w-4xl mt-5">
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
      </>
    </>
  );
}

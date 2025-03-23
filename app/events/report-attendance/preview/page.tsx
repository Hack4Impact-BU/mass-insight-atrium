// app/view-data/page.tsx
"use client";

import { useFile } from "@/utils/upload-data/file-context";
import { useState } from "react";
import { Typography, Button } from "@mui/material";

import { HotTable } from "@handsontable/react-wrapper";
import "handsontable/dist/handsontable.full.min.css";

import { registerAllModules } from "handsontable/registry";
import { redirect } from "next/navigation";

// Register all Handsontable modules (including filters)
registerAllModules();

export default function Preview() {
    const { fileData } = useFile();
    const [ loading , setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    if (!fileData || fileData.length === 0) {
        return <p className="text-center mt-10">No data to display</p>;
    }

    // Extract column keys from fileData
    const columns = Object.keys(fileData[0]);
    const columnSettings = columns.map((key) => ({
        data: key,
        title: key.charAt(0) + key.slice(1),
        width: 150,
    }));

    const uploadToSupabase = async () => {

    }

  return (
    <>
        <div className="w-full">
          <div className="flex flex-col items-center justify-between min-h-screen py-10 bg-gray-100">
            {/* Title Section */}
            <Typography variant="h4" className="font-extrabold mb-2">
              Review Attendance Data
            </Typography>

            {/* Spreadsheet Section */}
            <div className="flex flex-col items-center gap-10 mt-10">
              <div className="overflow-auto border border-gray-300 rounded-lg">
                {fileData ? (
                  <div
                    className="w-full flex-grow"
                    style={{ minWidth: "800px" }}
                  >
                    <HotTable
                      data={fileData}
                      colHeaders={columns} // Show headers from keys
                      columns={columnSettings} // Map JSON keys to columns
                      rowHeaders={true}
                      dropdownMenu={[
                        "filter_by_condition",
                        "filter_by_value",
                        "filter_action_bar",
                      ]}
                      columnSorting={true}
                      filters={true}
                      stretchH="all"
                      licenseKey="non-commercial-and-evaluation"
                      width="1400"
                      height="600px"
                    />
                  </div>
                ) : (
                  <p className="text-center text-gray-500">
                    {/* needs loading state added */}No file uploaded
                  </p>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between w-full max-w-4xl mt-5">
                <Button 
                    className="text-blue-600" 
                    variant="outlined"
                    onClick={(() => {
                        redirect("/events/report-attendance/upload");
                    })}
                >
                    <Typography className="normal-case p-3">Back</Typography>
                </Button>

                <Button
                    variant="contained"
                    className="normal-case bg-blue-600 text-white px-6"
                    disabled={!fileData}
                    onClick={uploadSupabase}
                >
                    <Typography className="normal-case p-3">Upload</Typography>
                </Button>
            </div>
          </div>
        </div>
    </>
  );
}

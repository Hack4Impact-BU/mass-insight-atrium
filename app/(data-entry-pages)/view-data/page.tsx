// app/view-data/page.tsx
"use client";

import { useFile } from "@/utils/xlsx/file-context";
import { useEffect, useRef } from "react";
import { Typography, Button } from "@mui/material";
import { handleFileUpload } from "@/utils/xlsx/parse-excel";

import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css";

import { registerAllModules } from "handsontable/registry";

// Register all Handsontable modules (including filters)
registerAllModules();

export default function ViewData() {
  const { file, fileData, setFile, setFileData } = useFile();
  const hotRef = useRef<HotTable>(null);
  useEffect(() => {
    const storedData = sessionStorage.getItem("fileData");
    if (storedData) {
      console.log("Restoring file data from sessionStorage");
      setFileData(JSON.parse(storedData));
    }
  }, [setFileData]);

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

  // Draft version of upload to supabase off next button

    const uploadSupabase = async () => {
      console.log();
      if (!fileData) {
          console.error("No file data found.");
          return;
        }

        try {
          // Determine if it's JSON or Excel based on file extension
          // const isJsonFile = fileData.name?.endsWith(".json");

          // Convert ArrayBuffer (from fileData) to Buffer
          const buffer = Buffer.from(await fileData);

          await handleFileUpload({ buffer }, true);
          console.log("File uploaded successfully!");
        } catch (error) {
          console.error("Failed to upload file:", error);
        }
    }

  return (
    <>
      {/* Needs to have navbar component added */}
      <>
        <div className="w-full">
          <div className="flex flex-col items-center justify-between min-h-screen py-10 bg-gray-100">
            {/* Title Section */}
            <Typography variant="h4" className="font-extrabold mb-2">
              Review Data Spreadsheet
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
              <Button className="text-blue-600" variant="outlined">
                <a href="/upload-data">
                  <Typography className="normal-case p-3">Back</Typography>
                </a>
              </Button>

              <Button
                variant="contained"
                className="normal-case bg-blue-600 text-white px-6"
                disabled={!fileData}
                onClick={uploadSupabase}
              >
                <a href="/next-step">
                  <Typography className="normal-case p-3">Upload</Typography>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </>
    </>
  );
}

// app/view-data/page.tsx
"use client";

import { useFile } from "@/utils/upload-data/file-context";
import { useEffect, useRef, useState } from "react";
import { Typography, Button, Alert } from "@mui/material";
import { uploadDataSheeToSupabase } from "@/utils/upload-data/master-data-upload";

import { HotTable } from "@handsontable/react-wrapper";
import "handsontable/dist/handsontable.full.min.css";

import { registerAllModules } from "handsontable/registry";

// Register all Handsontable modules (including filters)
registerAllModules();

export default function ViewData() {
  const { fileData, file } = useFile();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({});

  if (!fileData || fileData.length === 0) {
    return <p className="text-center mt-10">No data to display</p>;
  }

  // Extract column keys from fileData
  const columns = Object.keys(fileData[0]);
  const columnSettings = columns.map((key) => ({
    data: key,
    title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    width: 150,
    // Special handling for date_of_birth column
    ...(key === 'date_of_birth' && {
      type: 'numeric',
      numericFormat: {
        pattern: '0',
      },
    }),
  }));

  const validateData = () => {
    const errors: {[key: string]: string[]} = {};
    
    if (!fileData || fileData.length === 0) return;

    fileData.forEach((row, index) => {
      if (row.date_of_birth && !isNaN(Number(row.date_of_birth))) {
        const dateNum = Number(row.date_of_birth);
        if (dateNum < 25569 || dateNum > 47483) { // Valid Excel dates between 1970 and 2030
          if (!errors.date_of_birth) errors.date_of_birth = [];
          errors.date_of_birth.push(`Row ${index + 1}: Invalid date format. Please use Excel date format.`);
        }
      }
      
      if (!row.email?.includes('@')) {
        if (!errors.email) errors.email = [];
        errors.email.push(`Row ${index + 1}: Invalid email format`);
      }

      if (!['student', 'teacher', 'administrator'].includes(row.role_profile?.toLowerCase())) {
        if (!errors.role_profile) errors.role_profile = [];
        errors.role_profile.push(`Row ${index + 1}: Role must be student, teacher, or administrator`);
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadSupabase = async () => {
    if (!fileData) {
      setError("No file data found.");
      return;
    }

    if (!validateData()) {
      setError("Please fix validation errors before uploading.");
      return;
    }

    try {
      setError(null);
      await uploadDataSheeToSupabase(fileData);
      setSuccess("Data uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload file:", error);
      setError("Failed to upload file. Please check the console for details.");
    }
  };

  return (
    <>
      {/* Needs to have navbar component added */}
      <>
        <div className="w-full">
          <div className="flex flex-col items-center justify-between min-h-screen py-10 bg-gray-100">
            {/* Title Section */}
            <Typography variant="h4" className="font-extrabold mb-2">
              Review Data Spreadsheet: {file?.name}
            </Typography>

            {/* Validation Errors */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="w-full max-w-4xl mb-4">
                {Object.entries(validationErrors).map(([field, errors]) => (
                  <Alert key={field} severity="warning" className="mb-2">
                    <Typography variant="subtitle2" className="font-bold">
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')} Issues:
                    </Typography>
                    <ul className="list-disc pl-4">
                      {errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                ))}
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" className="mb-4 w-full max-w-4xl">
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" className="mb-4 w-full max-w-4xl">
                {success}
              </Alert>
            )}

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
                      colHeaders={columns.map(col => col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' '))}
                      columns={columnSettings}
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
                {/* <a href="/next-step"> */}
                  <Typography className="normal-case p-3">Upload</Typography>
                {/* </a> */}
              </Button>
            </div>
          </div>
        </div>
      </>
    </>
  );
}

"use client";

import { Button, Typography } from "@mui/material";
import { UploadFileButton } from "@/components/report-attendance/UploadFileButton";
import { redirect } from "next/navigation";
import { useFile } from "@/utils/upload-data/file-context";
import { useState } from "react";

export default function Upload() {
  const { file, setFile, setFileData } = useFile();
  const [loading, setLoading] = useState(false);

  //TODO: Add message to display error
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col items-center justify-between min-h-screen py-20 bg-gray-100 m-30 ">
          <div className="flex flex-col items-center gap-10 ">
            <Typography variant="h4" className="font-extrabold mb-2">
              Import data spreadsheet
            </Typography>
            <Typography
              variant="body1"
              className="text-gray-600 mb-6 text-center"
            >
              Import the Zoom Attendance Report as a .csv file to generate insights and compare event reports.
            </Typography>
          </div>

          <div className="relative mt-10">
            <UploadFileButton file={file} setFile={setFile} setFileData={setFileData} setLoading={setLoading} setError={setError} />
          </div>

          <div>
            <div className="flex-col flex items-center">
              <Typography variant="h6" className="font-bold mt-6">
                NOTICE:
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-600 max-w-4xl text-center"
              >
                Please do not change the file formatting or column headers from the original Zoom Attendance Report.
              </Typography>
            </div>

            <div className="flex justify-between w-full max-w-4xl mt-20">
              <div className="flex gap-4">
                <Button className="text-blue-600" variant="outlined">
                  <Typography className="normal-case p-3">Cancel</Typography>
                </Button>
                <Button
                  variant="contained"
                  className="normal-case bg-blue-400 text-white px-6"
                >
                  <Typography className="normal-case p-3">Previous</Typography>
                </Button>
              </div>
              <Button
                variant="contained"
                className="normal-case bg-blue-600 text-white px-6"
                disabled={!file || loading}
                onClick={() => {
                  redirect("/events/report-attendance/preview");
                }}
              >
                  <Typography className="normal-case p-3">
                    {
                      loading ? "Parsing file..." : "Next"
                    }
                  </Typography>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

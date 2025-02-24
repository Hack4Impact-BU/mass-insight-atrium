"use client";

import { Button, Typography } from "@mui/material";
import { UploadFileButton } from "@/components/upload-file-button";
import { useFile } from "@/utils/xlsx/file-context";

export default function uploadData() {
  const { file, setFile } = useFile();
  console.log("UploadData file:", file);

  return (
    <>
      {/* Needs to have navbar component added */}
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
              Import a .xlsx or .csv to generate insights and compare event
              reports.
            </Typography>
          </div>

          <div className="relative mt-10">
            <UploadFileButton></UploadFileButton>
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
                Please format your invitee list appropriately with distinct data
                fields so that it may be imported more easily. Be sure to at
                least include the fields “First Name”, “Last Name” and/or
                “Email”.
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
                disabled={!file}
              >
                {/* disable next until file is uploaded */}
                <a href="/view-data">
                  <Typography className="normal-case p-3">Next</Typography>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

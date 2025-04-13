"use client";

import React from "react";
import { Button, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import * as Papa from "papaparse";

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

export type UploadFileButtonProps = {
  file: File | null;
  setFile: (file: File | null) => void;
  setFileData: (data: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

const COLUMNS = ["Name(Original Name)","User Email","Join Time","Leave Time","Duration (Minutes)"]

export const UploadFileButton: React.FC<UploadFileButtonProps> = ({
  file,
  setFile,
  setFileData,
  setLoading,
setError,
}) => {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const uploadedFile = event.target.files?.[0];
    setLoading(true);
    setError(null);
    try {
        if (!uploadedFile) {
            throw new Error("No file uploaded.");
        }

        if (uploadedFile.type !== "text/csv") {
            throw new Error("File must be a CSV file.");
        }

        const text = await uploadedFile.text();

        const result = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            delimiter: ",",
        });

        if (result.errors.length) {
            var msg = '';
            result.errors.forEach((error) => {
            msg += error.message + '\n';
            });
            throw new Error(msg);
        }

        const parsedData = result.data as Object[];
        const columns = Object.keys(parsedData[0]);

        if (!COLUMNS.every(col => columns.includes(col))) {
            throw new Error("File columns do not match the required format.");
        }
        setFile(uploadedFile);
        setFileData(parsedData);
        setLoading(false);
        setError(null);
    } catch (error: any) {
        setFile(null);
        setFileData([]);
        setLoading(false);
        setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        className="border-2 border-gray-400 rounded-lg "
        variant="outlined"
        component="label"
      >
        <Box className="size-100 items-center">
          <div className="flex flex-col p-10 items-center">
            <CloudUploadIcon className="w-20 h-20 text-gray-600 mb-4" />
            <Typography className="normal-case">
              {file ? file.name : "Import new spreadsheet"}
            </Typography>
          </div>
        </Box>

        <VisuallyHiddenInput
          type="file"
          accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileChange}
        />
      </Button>
    </div>
  );
};

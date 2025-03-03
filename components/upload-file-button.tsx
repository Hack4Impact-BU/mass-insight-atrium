"use client";

import React from "react";
import { Button, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { isValidFileType, isValidFormat } from "@/utils/upload-data/master-data-upload";
import * as XLSX from "xlsx";

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
};

export const UploadFileButton: React.FC<UploadFileButtonProps> = ({
  file,
  setFile,
  setFileData,
}) => {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const uploadedFile = event.target.files?.[0];
    try {
      if (!uploadedFile) {
        throw new Error("No file uploaded.");
      }
      const reader = new FileReader();
      const validExtensions = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      reader.onload = (e) => {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        if (!isValidFileType(uploadedFile, validExtensions)) {
          throw new Error("Invalid file type. Please upload a .csv or .xlsx file.");
        }
        // TODO: Add check for required columns, this always returns true
        if (!isValidFormat(jsonData)) {
          throw new Error("Invalid file format. Please ensure the file contains the required columns.");
        }
        setFile(uploadedFile);
        setFileData(jsonData);
      }
      reader.readAsArrayBuffer(uploadedFile);
    } catch (error: any) {
      setFile(null);
      setFileData([]);
      alert(error.message);
    }


      // const validExtensions = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      // const fileExtension = uploadedFile.type;
      // console.log(fileExtension);

      // if (validExtensions.includes(fileExtension)) {
      //   setFile(uploadedFile);

      //   // Parse the uploaded file
      //   const reader = new FileReader();
      //   reader.readAsArrayBuffer(uploadedFile);
      //   reader.onload = (e) => {
      //     const buffer = e.target?.result;
      //     const workbook = XLSX.read(buffer, { type: "array" });

      //     // Get first sheet and convert to JSON
      //     const sheetName = workbook.SheetNames[0];
      //     const worksheet = workbook.Sheets[sheetName];
      //     const jsonData = XLSX.utils.sheet_to_json(worksheet);

      //     setFileData(jsonData);
      //   };
      // } else {
      //   setFile(null);
      //   setFileData([]);
      //   alert("Invalid file type. Please upload a .csv or .xlsx file.");
      // }
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

"use client";

import { Button, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useFile } from "@/utils/xlsx/file-context";
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

export function UploadFileButton() {
  const { file, setFile, setFileData } = useFile();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const uploadedFile = event.target.files?.[0];

    if (uploadedFile) {
      const validExtensions = [".csv", ".xlsx"];
      const fileExtension = uploadedFile.name
        .slice(uploadedFile.name.lastIndexOf("."))
        .toLowerCase();

      if (validExtensions.includes(fileExtension)) {
        setFile(uploadedFile);

        // Parse the uploaded file
        const reader = new FileReader();
        reader.readAsArrayBuffer(uploadedFile);
        reader.onload = (e) => {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: "array" });

          // Get first sheet and convert to JSON
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log("Parsed Data:", jsonData); // Debug output
          setFileData(jsonData);
        };
      } else {
        alert("Invalid file type. Please upload a .csv or .xlsx file.");
      }
    }
  };

  //   clear file button const

  //  also need to make button text change to the file name

  return (
    <>
      <div className="flex flex-col items-center">
        <Button
          className="border-2 border-gray-400 rounded-lg "
          variant="outlined"
          component="label"
        >
          {/* how to make this box a fixed nice square */}
          <Box className="size-100 items-center">
            <div className="flex flex-col p-10 items-center">
              <CloudUploadIcon className="w-20 h-20 text-gray-600 mb-4" />
              <Typography className="normal-case">
                {file ? file.name : "Import new spreadsheet"}
              </Typography>
              {/* <Button variant="text" hidden={!file}>
                <Typography className="normal-case">Clear</Typography>
              </Button> */}
            </div>
          </Box>

          <VisuallyHiddenInput
            type="file"
            accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
          />
        </Button>
      </div>
    </>
  );
}

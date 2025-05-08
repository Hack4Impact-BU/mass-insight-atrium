import React, { useRef } from "react";
import { Box, Button, Typography, Alert, Paper } from "@mui/material";
import Papa from "papaparse";
import { RowType } from "../page";

const SY_FIELD_MAP = [
  { regex: /^sy\d{4}_\d{2}_participation_limits$/, key: "sy_participation_limits" },
  { regex: /^sy\d{4}_\d{2}_course$/, key: "sy_course" },
  { regex: /^sy\d{4}_\d{2}_grade_level$/, key: "sy_grade_level" },
];

const REQUIRED_HEADERS = [
  "first_name",
  "last_name",
  "id",
  "date_of_birth",
  "email",
  "role_profile",
  "race_ethnicity",
  "state_work",
  "district_name",
  "district_id",
  "school_name",
  "school_id",
  "sy2024_25_participation_limits",
  "content_area",
  "sy2024_25_course",
  "sy2024_25_grade_level",
];

type Props = {
  file: File | null;
  setFile: (file: File | null) => void;
  setStep: (step: number) => void;
  setParsedRows: (rows: RowType[]) => void;
  setHeaderErrors: (errors: string[]) => void;
  setRowErrors: (errors: { [rowIndex: number]: string[] }) => void;
};

const ReportUploadStep: React.FC<Props> = ({
  file,
  setFile,
  setStep,
  setParsedRows,
  setHeaderErrors,
  setRowErrors,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setError(null);
      setHeaderErrors([]);
      setRowErrors({});
      parseFile(file);
    }
  };

  const parseFile = (file: File) => {
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setLoading(false);
        const headers = results.meta.fields || [];
        // Check for missing required headers
        const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
        if (missing.length > 0) {
          setHeaderErrors(missing);
          setError(
            `Missing required headers: ${missing.join(", ")}`
          );
          setParsedRows([]);
          return;
        }
        setHeaderErrors([]);
        setParsedRows(results.data as RowType[]);
        setStep(1);
      },
      error: (err) => {
        setLoading(false);
        setError("Failed to parse CSV: " + err.message);
      },
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Upload Data
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Upload a CSV file with the following headers:
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 2, background: "#f9f9f9", maxWidth: 1, overflowX: 'auto' }}>
        <Typography variant="caption" component="pre" sx={{ fontFamily: "monospace", wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
          {REQUIRED_HEADERS.join(", ")}
        </Typography>
      </Paper>
      <Button
        variant="contained"
        component="label"
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? "Parsing..." : file ? file.name : "Select CSV File"}
        <input
          type="file"
          accept=".csv"
          hidden
          ref={inputRef}
          onChange={handleFileChange}
        />
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default ReportUploadStep; 
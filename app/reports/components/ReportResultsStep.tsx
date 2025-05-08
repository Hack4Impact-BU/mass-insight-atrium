import React from "react";
import { Box, Typography, Button, Alert, Paper } from "@mui/material";
import { RowType } from "../page";

type Props = {
  processSummary: { added: number; updated: number; errors: number } | null;
  errorRows: RowType[];
  setStep: (step: number) => void;
  setFile: (file: File | null) => void;
  setParsedRows: (rows: RowType[]) => void;
  setHeaderErrors: (errors: string[]) => void;
  setRowErrors: (errors: { [rowIndex: number]: string[] }) => void;
  setProcessSummary: (summary: { added: number; updated: number; errors: number } | null) => void;
  setErrorRows: (rows: RowType[]) => void;
};

function downloadCSV(rows: RowType[]) {
  const headers = Object.keys(rows[0] || {}).join(",");
  const csv =
    headers +
    "\n" +
    rows.map((row) => Object.values(row).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "error_rows.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const ReportResultsStep: React.FC<Props> = ({
  processSummary,
  errorRows,
  setStep,
  setFile,
  setParsedRows,
  setHeaderErrors,
  setRowErrors,
  setProcessSummary,
  setErrorRows,
}) => {
  const handleRestart = () => {
    setFile(null);
    setParsedRows([]);
    setHeaderErrors([]);
    setRowErrors({});
    setProcessSummary(null);
    setErrorRows([]);
    setStep(0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Import Results
      </Typography>
      {processSummary && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2">
            <strong>Added:</strong> {processSummary.added} <br />
            <strong>Updated:</strong> {processSummary.updated} <br />
            <strong>Errors:</strong> {processSummary.errors}
          </Typography>
        </Paper>
      )}
      {errorRows.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorRows.length} rows failed to import. <Button onClick={() => downloadCSV(errorRows)}>Download Errors</Button>
        </Alert>
      )}
      <Button variant="contained" onClick={handleRestart}>
        Upload Another CSV
      </Button>
    </Box>
  );
};

export default ReportResultsStep; 
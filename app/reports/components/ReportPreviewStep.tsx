import React from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Alert } from "@mui/material";
import { RowType } from "../page";

type Props = {
  parsedRows: RowType[];
  rowErrors: { [rowIndex: number]: string[] };
  setStep: (step: number) => void;
};

const ReportPreviewStep: React.FC<Props> = ({ parsedRows, rowErrors, setStep }) => {
  const previewRows = parsedRows.slice(0, 20);
  const hasErrors = Object.keys(rowErrors).length > 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Preview Data
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Showing the first 20 rows of your CSV. Rows with errors are highlighted.
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {Object.keys(previewRows[0] || {}).map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewRows.map((row, idx) => (
              <TableRow
                key={idx}
                sx={rowErrors[idx] ? { backgroundColor: '#ffeaea' } : {}}
              >
                {Object.values(row).map((val, i) => (
                  <TableCell key={i}>{val}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {hasErrors && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Some rows have errors and will not be processed. Please fix your CSV and re-upload.
        </Alert>
      )}
      <Box display="flex" gap={2}>
        <Button variant="outlined" onClick={() => setStep(0)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => setStep(2)}
          disabled={hasErrors}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default ReportPreviewStep; 
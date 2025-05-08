import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress, Alert, Paper } from "@mui/material";
import { RowType } from "../page";

type Props = {
  parsedRows: RowType[];
  setStep: (step: number) => void;
  setProcessSummary: (summary: { added: number; updated: number; errors: number }) => void;
  setErrorRows: (rows: RowType[]) => void;
};

const ReportProcessStep: React.FC<Props> = ({ parsedRows, setStep, setProcessSummary, setErrorRows }) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Simulate progress bar
    if (progress < 100) {
      const timer = setTimeout(() => setProgress(progress + 10), 120);
      return () => clearTimeout(timer);
    } else {
      // When progress is done, POST to API
      (async () => {
        try {
          const response = await fetch("/api/reports/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows: parsedRows }),
          });
          const data = await response.json();
          if (!response.ok || data.status !== "success") {
            throw new Error(data.error || "Failed to upload data");
          }
          if (!cancelled) {
            setProcessSummary(data.summary);
            setErrorRows(data.errors || []);
            setStep(3);
          }
        } catch (err: any) {
          if (!cancelled) setError(err.message || "Failed to upload data");
        }
      })();
    }
    return () => { cancelled = true; };
  }, [progress, parsedRows, setProcessSummary, setErrorRows, setStep]);

  return (
    <Box textAlign="center">
      <Typography variant="h5" gutterBottom>
        Processing Data
      </Typography>
      <Paper sx={{ mt: 4, p: 3, maxWidth: 400, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Importing your data. This may take a moment...
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="primary"
          sx={{ height: 8, borderRadius: 4, width: '100%', boxShadow: 1, transition: 'all 0.3s cubic-bezier(.4,2,.6,1)' }}
        />
      </Paper>
      {error && <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>}
    </Box>
  );
};

export default ReportProcessStep; 
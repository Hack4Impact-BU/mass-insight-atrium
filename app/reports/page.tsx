"use client";

import React, { useState } from 'react';
import { Typography, Button, Paper, Alert, CircularProgress, Container, Stepper, Step, StepLabel, Box } from '@mui/material';
import { createClient } from '@/utils/supabase/client';
import Papa from 'papaparse';
import ReportUploadStep from "./components/ReportUploadStep";
import ReportPreviewStep from "./components/ReportPreviewStep";
import ReportProcessStep from "./components/ReportProcessStep";
import ReportResultsStep from "./components/ReportResultsStep";

// Function to convert Excel serial date to YYYY-MM-DD
const convertExcelDate = (excelDate: string | number): string | null => {
  // If empty or not a number, return null
  if (!excelDate || isNaN(Number(excelDate))) {
    return null;
  }

  try {
    // Convert to number and adjust for Excel's date system
    const days = Number(excelDate) - 25569;
    const date = new Date(days * 86400 * 1000);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      return null;
    }

    // Format as YYYY-MM-DD
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error converting date:', error);
    return null;
  }
};

export type RowType = {
  first_name: string;
  last_name: string;
  id: string;
  date_of_birth: string;
  email: string;
  role_profile: string;
  race_ethnicity: string;
  state_work: string;
  district_name: string;
  district_id: string;
  school_name: string;
  school_id: string;
  sy2023_24_participation_limits: string;
  content_area: string;
  sy2023_24_course: string;
  sy2023_24_grade_level: string;
};

const steps = ["Upload CSV", "Preview Data", "Process", "Results"];

type StepType = 0 | 1 | 2 | 3;

export default function ReportsPage() {
  const [step, setStepRaw] = useState<StepType>(0);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<RowType[]>([]);
  const [headerErrors, setHeaderErrors] = useState<string[]>([]);
  const [rowErrors, setRowErrors] = useState<{ [rowIndex: number]: string[] }>({});
  const [processSummary, setProcessSummary] = useState<{
    added: number;
    updated: number;
    errors: number;
  } | null>(null);
  const [errorRows, setErrorRows] = useState<RowType[]>([]);

  // Wrap setStep to match (step: number) => void signature
  const setStep = (step: number) => setStepRaw(step as StepType);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box>
          {step === 0 && (
            <ReportUploadStep
              file={file}
              setFile={setFile}
              setStep={setStep}
              setParsedRows={setParsedRows}
              setHeaderErrors={setHeaderErrors}
              setRowErrors={setRowErrors}
            />
          )}
          {step === 1 && (
            <ReportPreviewStep
              parsedRows={parsedRows}
              rowErrors={rowErrors}
              setStep={setStep}
            />
          )}
          {step === 2 && (
            <ReportProcessStep
              parsedRows={parsedRows}
              setStep={setStep}
              setProcessSummary={setProcessSummary}
              setErrorRows={setErrorRows}
            />
          )}
          {step === 3 && (
            <ReportResultsStep
              processSummary={processSummary}
              errorRows={errorRows}
              setStep={setStep}
              setFile={setFile}
              setParsedRows={setParsedRows}
              setHeaderErrors={setHeaderErrors}
              setRowErrors={setRowErrors}
              setProcessSummary={setProcessSummary}
              setErrorRows={setErrorRows}
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
} 
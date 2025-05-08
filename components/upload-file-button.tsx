"use client";

import React, { useState, useCallback, useRef } from "react";
import { Button, Typography, Box, CircularProgress, Alert, Snackbar, useTheme, alpha } from "@mui/material";
import { CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon } from "@mui/icons-material";
import { useAppDispatch } from "@/lib/store";
import { setRefreshTrigger } from "@/lib/features/masterTableSlice";
import { useErrorHandler } from "@/lib/hooks/useErrorHandler";
import { useLoadingState } from "@/lib/hooks/useLoadingState";

interface UploadFileButtonProps {
  endpoint: string;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in bytes
  onUploadComplete?: () => void;
  onUploadError?: (error: Error) => void;
  buttonText?: string;
  successMessage?: string;
  errorMessage?: string;
}

const UploadFileButton = ({
  endpoint,
  acceptedFileTypes = '.csv,.xlsx,.xls',
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  onUploadComplete,
  onUploadError,
  buttonText = 'Upload File',
  successMessage = 'File uploaded successfully',
  errorMessage = 'Failed to upload file'
}: UploadFileButtonProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { handleError } = useErrorHandler();
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const validateFile = useCallback((file: File): string | null => {
    if (!file) return 'No file selected';
    
    if (file.size > maxFileSize) {
      return `File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit`;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = acceptedFileTypes
      .split(',')
      .map(type => type.replace('.', '').toLowerCase());

    if (!fileExtension || !acceptedExtensions.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedFileTypes}`;
    }

    return null;
  }, [maxFileSize, acceptedFileTypes]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadStatus('error');
      setStatusMessage(validationError);
      return;
    }

    try {
      startLoading();
      setUploadStatus('idle');
      setStatusMessage('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setUploadStatus('success');
      setStatusMessage(successMessage);
      dispatch(setRefreshTrigger(Date.now()));
      onUploadComplete?.();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : errorMessage);
      handleError(error);
      onUploadError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      stopLoading();
    }
  }, [
    endpoint,
    validateFile,
    startLoading,
    stopLoading,
    handleError,
    onUploadComplete,
    onUploadError,
    successMessage,
    errorMessage,
    dispatch
  ]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setUploadStatus('idle');
    setStatusMessage('');
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        style={{ display: 'none' }}
      />
      
      <Button
        variant="contained"
        onClick={handleButtonClick}
        disabled={isLoading}
        startIcon={
          isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : uploadStatus === 'success' ? (
            <CheckCircleIcon />
          ) : uploadStatus === 'error' ? (
            <ErrorIcon />
          ) : (
            <CloudUploadIcon />
          )
        }
        sx={{
          minWidth: 200,
          backgroundColor: uploadStatus === 'success' 
            ? theme.palette.success.main 
            : uploadStatus === 'error'
            ? theme.palette.error.main
            : theme.palette.primary.main,
          '&:hover': {
            backgroundColor: uploadStatus === 'success'
              ? alpha(theme.palette.success.main, 0.9)
              : uploadStatus === 'error'
              ? alpha(theme.palette.error.main, 0.9)
              : alpha(theme.palette.primary.main, 0.9),
          },
        }}
      >
        {isLoading ? 'Uploading...' : buttonText}
      </Button>

      {statusMessage && (
        <Typography
          variant="body2"
          color={
            uploadStatus === 'success'
              ? 'success.main'
              : uploadStatus === 'error'
              ? 'error.main'
              : 'text.secondary'
          }
          sx={{ textAlign: 'center' }}
        >
          {statusMessage}
        </Typography>
      )}

      <Snackbar
        open={uploadStatus !== 'idle'}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={uploadStatus === 'success' ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {statusMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadFileButton;

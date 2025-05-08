'use client';

import React, { memo } from 'react';
import { Button, Typography, Box, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundaryClass extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log error to your error tracking service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          onReset={this.handleReset}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

// Memoized error fallback component
const ErrorFallback = memo(({ 
  error, 
  onReset, 
  onReload 
}: { 
  error?: Error;
  onReset: () => void;
  onReload: () => void;
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
        textAlign: 'center',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <ErrorOutlineIcon 
        sx={{ 
          fontSize: 64, 
          color: theme.palette.error.main,
          mb: 2 
        }} 
      />
      <Typography variant="h4" component="h1" gutterBottom>
        Oops! Something went wrong
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        paragraph
        sx={{ maxWidth: '600px', mb: 4 }}
      >
        {error?.message || 'An unexpected error occurred'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onReset}
          sx={{ minWidth: 120 }}
        >
          Try Again
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={onReload}
          sx={{ minWidth: 120 }}
        >
          Reload Page
        </Button>
      </Box>
    </Box>
  );
});

ErrorFallback.displayName = 'ErrorFallback';

// Memoize the entire ErrorBoundary component
const ErrorBoundary = memo((props: Props) => (
  <ErrorBoundaryClass {...props} />
));

ErrorBoundary.displayName = 'ErrorBoundary';

export default ErrorBoundary; 
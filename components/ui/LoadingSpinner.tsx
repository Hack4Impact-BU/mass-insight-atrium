'use client';

import { Box, CircularProgress, useTheme } from '@mui/material';
import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  fullScreen?: boolean;
  overlay?: boolean;
  message?: string;
}

const LoadingSpinner = memo(({ 
  size = 40, 
  color = 'primary',
  fullScreen = true,
  overlay = false,
  message
}: LoadingSpinnerProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...(fullScreen && {
          minHeight: '100vh',
          width: '100%',
        }),
        ...(overlay && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: theme.zIndex.modal,
        }),
      }}
    >
      <CircularProgress 
        size={size} 
        color={color}
        thickness={4}
        sx={{
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            '0%': {
              transform: 'rotate(0deg)',
            },
            '100%': {
              transform: 'rotate(360deg)',
            },
          },
        }}
      />
      {message && (
        <Box
          sx={{
            mt: 2,
            color: theme.palette[color].main,
            typography: 'body2',
            textAlign: 'center',
          }}
        >
          {message}
        </Box>
      )}
    </Box>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner; 
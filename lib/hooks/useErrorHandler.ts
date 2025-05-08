import { useCallback } from 'react';

interface ErrorHandlerOptions {
  onError?: (error: Error) => void;
  logToConsole?: boolean;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { onError, logToConsole = true } = options;

  const handleError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    if (logToConsole) {
      console.error('Error:', errorObject);
    }

    onError?.(errorObject);
  }, [onError, logToConsole]);

  return { handleError };
} 
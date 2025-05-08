'use client';

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { makeStore } from "@/lib/store";
import theme from "../theme";
import { LoadingProvider } from "./LoadingProvider";
import StoreProvider from "../StoreProvider";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import AuthProvider from "../components/AuthProvider";

export function ClientProviders({ children }: { children: ReactNode }) {
  const store = makeStore();
  
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingProvider>
          <StoreProvider>
            <AppRouterCacheProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </AppRouterCacheProvider>
          </StoreProvider>
        </LoadingProvider>
      </ThemeProvider>
    </Provider>
  );
} 
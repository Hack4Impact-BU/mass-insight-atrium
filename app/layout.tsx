import { Inter } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import { Suspense } from "react";
import { Provider } from "react-redux";
import StoreProvider from "./StoreProvider";
import Navbar from "../components/Navbar";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Atrium",
  description: "MassInsight Event Management Platform",
};

const inter = Inter({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`bg-background text-foreground ${inter.className}`}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <StoreProvider>
              <Suspense>
                <main className="min-h-screen max-h-screen min-w-full max-w-full">
                  <Navbar></Navbar>
                  {children}
                </main>
              </Suspense>
            </StoreProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

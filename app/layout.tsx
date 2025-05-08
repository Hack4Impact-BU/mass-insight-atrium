import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense, memo } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ReactNode } from "react";
import { Viewport } from 'next';
import Navbar from "../components/Navbar";
import { ClientProviders } from "./providers/ClientProviders";

export const metadata = {
  title: "Atrium",
  description: "MassInsight Event Management Platform",
  themeColor: "#ffffff",
};

const inter = Inter({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Memoize the main content to prevent unnecessary re-renders
const MainContent = memo(({ children }: { children: React.ReactNode }) => (
  <main className="min-h-screen max-h-screen min-w-full max-w-full">
    <Navbar />
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  </main>
));

MainContent.displayName = 'MainContent';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`bg-background text-foreground ${inter.className}`}>
        <ErrorBoundary>
          <ClientProviders>
            <MainContent>{children}</MainContent>
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}

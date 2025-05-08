"use client"
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Email dashboard will be the first and last page of sending an email

const EmailDashboardContent = dynamic(
  () => import("./EmailDashboardContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function EmailDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailDashboardContent />
    </Suspense>
  );
}
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const RecipientsContent = dynamic(
  () => import("./RecipientsContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function RecipientsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipientsContent />
    </Suspense>
  );
}
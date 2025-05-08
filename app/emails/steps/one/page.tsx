"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const ImportRecipientsContent = dynamic(
  () => import("./ImportRecipientsContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function ImportRecipientsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImportRecipientsContent />
    </Suspense>
  );
}
"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const PreviewContent = dynamic(
  () => import("@/app/emails/steps/four/PreviewContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function PreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
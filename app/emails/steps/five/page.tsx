"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const SendPageContent = dynamic(
  () => import("@/app/emails/steps/five/SendPageContent"),
  {
    loading: () => <div>Loading...</div>
  }
);

export default function SendPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendPageContent />
    </Suspense>
  );
}
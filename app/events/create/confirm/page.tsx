"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const ConfirmContent = dynamic(
  () => import("./ConfirmContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  );
} 
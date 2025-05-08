"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const CampaignsContent = dynamic(
  () => import("@/app/emails/campaigns/CampaignsContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function CampaignsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CampaignsContent />
    </Suspense>
  );
} 
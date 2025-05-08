"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

const ProtectedContent = dynamic(
  () => import("@/app/protected/ProtectedContent"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function ProtectedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProtectedContent />
    </Suspense>
  );
}

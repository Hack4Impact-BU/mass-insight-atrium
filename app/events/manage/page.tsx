import { Suspense } from "react";
import dynamic from "next/dynamic";

const EventsManageContent = dynamic(
  () => import("@/app/events/manage/EventsManageContent"),
  {
    loading: () => <div>Loading...</div>
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsManageContent />
    </Suspense>
  );
}

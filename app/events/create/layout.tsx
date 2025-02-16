import { ReactNode, Suspense } from "react";
import { EventFormContextProvider } from "./event-form-provider";
import Steps from "./components/StepperWrapper";

export const steps = [
  { name: "Event Name", route: "start" },
  { name: "Event Description", route: "description" },
  { name: "Import Invitees", route: "import" },
  { name: "Schedule Event", route: "schedule" },
];
export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <div className="px-10">
        <Steps></Steps>
        {/* shouldn't cause a performance issue since only the forms consume this state, and the forms are only in CreateEvent  */}
        <EventFormContextProvider>{children}</EventFormContextProvider>
      </div>
    </Suspense>
  );
}

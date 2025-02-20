import { ReactNode, Suspense } from "react";
import { MeetingFormContextProvider } from "./meeting-form-provider";
import Steps from "./components/StepperWrapper";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <div className="px-10">
        <Steps></Steps>
        {/* shouldn't cause a performance issue since only the forms consume this state, and "children" should only be the forms */}
        {/* if performance DOES become an issue, then one can just set local state to each of the forms and set their initial values to the context values */}
        <MeetingFormContextProvider>{children}</MeetingFormContextProvider>
      </div>
    </Suspense>
  );
}

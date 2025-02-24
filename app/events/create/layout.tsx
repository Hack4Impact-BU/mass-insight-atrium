import { ReactNode, Suspense } from "react";
import Steps from "./components/StepperWrapper";
// import { RedirectManager } from "./RedirectManager";
import StoreProvider from "@/app/StoreProvider";
import { RedirectManager } from "./RedirectManager";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    // <RedirectManager>
    <RedirectManager>
      <Suspense>
        <div className="px-10">
          <Steps></Steps>
          {children}
          {/* shouldn't cause a performance issue since only the forms consume this state, and "children" should only be the forms */}
          {/* if performance DOES become an issue, then one can just set local state to each of the forms and set their initial values to the context values */}
        </div>
      </Suspense>
    </RedirectManager>

    // </RedirectManager>
  );
}

"use client";
import { useActionState, useEffect, useState } from "react";
import { ImportStep, SelectStep } from "./ImportFormSteps";
import { Button } from "@mui/material";
import { importFormAction } from "../../actions";
import { MRT_RowSelectionState } from "material-react-table";
import { useDispatch } from "react-redux";
import { updateFields } from "@/lib/features/eventCreateForm/eventCreateFormSlice";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useProgressContext } from "../RedirectManager";
import { steps } from "../../utils";

export default function ImportForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [data, setData] = useState([]);
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [, formAction, isPending] = useActionState(() => {
    const people = [];
    const rowSelectionKeys = Object.keys(rowSelection);
    for (const key of rowSelectionKeys) {
      const result = { firstName: "", lastName: "", emailAddress: "" };
      const selectedRow = data[parseInt(key)]; // assumed to always be on type number because of rowSelection
      for (const selectedRowKey of Object.keys(selectedRow)) {
        const normalizedKey = selectedRowKey.toLowerCase().replace(/\s+/g, "");
        if (normalizedKey === "firstname") {
          result.firstName = selectedRow[selectedRowKey];
        }
        if (normalizedKey === "lastname") {
          result.lastName = selectedRow[selectedRowKey];
        }
        if (normalizedKey === "emailaddress") {
          result.emailAddress = selectedRow[selectedRowKey];
        }
      }
      people.push(result);
    }
    dispatch(updateFields({ attendees: people }));
    next();
    router.push("/events/create/schedule");
  }, null);
  const pathname = usePathname();
  const { prev, next, pageNum } = useProgressContext();
  const nextPage = () => setStep((step) => step + 1);
  const prevPage = () => {
    if (step > 0) {
      setStep((step) => step - 1);
    }
  };
  const forms = [
    <ImportStep
      key="Import"
      next={nextPage}
      setData={(data) => {
        setData(data);
      }}
    ></ImportStep>,
    <SelectStep
      key="Select"
      data={data}
      rowSelection={rowSelection}
      setRowSelection={setRowSelection}
    ></SelectStep>,
  ];
  useEffect(() => {
    if (steps[pageNum].route != pathname) {
      redirect(steps[pageNum].route);
    }
  }, [pageNum, pathname]);

  return (
    <form action={formAction}>
      {forms[step]}
      {step != 0 && step < forms.length - 1 && (
        <Button type="button" onClick={nextPage} loading={isPending}>
          Next
        </Button>
      )}
      {step == forms.length - 1 && (
        <Button type="submit" loading={isPending}>
          Submit
        </Button>
      )}
      {step != 0 && (
        <Button type="button" onClick={prevPage} loading={isPending}>
          Previous
        </Button>
      )}
      {step == 0 && (
        <Button
          type="button"
          onClick={() => {
            prev();
            router.push("/events/create/description");
          }}
          loading={isPending}
        >
          Previous
        </Button>
      )}
    </form>
  );
}

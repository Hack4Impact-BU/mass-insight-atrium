"use client";
import { useActionState, useState } from "react";
import { ImportStep, SelectStep } from "./ImportFormSteps";
import { Button } from "@mui/material";
import { importFormAction } from "../../actions";
import { MRT_RowSelectionState } from "material-react-table";
import { useMeetingFormContext } from "../meeting-form-provider";

export default function ImportForm() {
  const { updateFields } = useMeetingFormContext();
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
    updateFields({ attendees: people });
    importFormAction();
  }, null);
  const [filters, setFilters] = useState<unknown[]>([]);
  const next = () => setStep((step) => step + 1);
  const prev = () => {
    if (step > 0) {
      setStep((step) => step - 1);
    }
  };
  const forms = [
    <ImportStep
      key="Import"
      next={next}
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
  return (
    <form action={formAction}>
      {forms[step]}
      {step != 0 && step < forms.length - 1 ? (
        <Button type="button">Next</Button>
      ) : (
        <Button type="submit">Submit</Button>
      )}
      {step > 0 && <Button type="button">Previous</Button>}
    </form>
  );
}

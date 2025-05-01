"use client";
import { useActionState, useEffect, useState } from "react";
import { Button, Typography, Box, Chip } from "@mui/material";
import { importFormAction } from "../../actions";
import { useDispatch } from "react-redux";
import { updateFields } from "@/lib/features/eventCreateForm/eventCreateFormSlice";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useProgressContext } from "../RedirectManager";
import { steps } from "../../utils";
import { ImportStep, SelectStep } from "./ImportFormSteps";
import PeopleSelector from "./PeopleSelector";
import { Database } from "@/utils/supabase/types";

type Person = Database["public"]["Tables"]["people"]["Row"];

interface CSVRow {
  [key: string]: string;
}

interface Attendee {
  firstName: string;
  lastName: string;
  emailAddress: string;
}

export default function ImportForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvRowSelection, setCsvRowSelection] = useState<Record<string, boolean>>({});
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const pathname = usePathname();
  const { prev, next, pageNum } = useProgressContext();

  const handleSubmit = () => {
    const people: Attendee[] = [];

    // Process CSV selections
    const rowSelectionKeys = Object.keys(csvRowSelection);
    for (const key of rowSelectionKeys) {
      const result: Attendee = { firstName: "", lastName: "", emailAddress: "" };
      const selectedRow = csvData[parseInt(key)];
      for (const selectedRowKey of Object.keys(selectedRow)) {
        const normalizedKey = selectedRowKey.toLowerCase().replace(/\s+/g, "");
        if (normalizedKey === "firstname" || normalizedKey === "first_name") {
          result.firstName = selectedRow[selectedRowKey];
        }
        if (normalizedKey === "lastname" || normalizedKey === "last_name") {
          result.lastName = selectedRow[selectedRowKey];
        }
        if (normalizedKey === "emailaddress" || normalizedKey === "email") {
          result.emailAddress = selectedRow[selectedRowKey];
        }
      }
      people.push(result);
    }

    // Add selected people from groups
    const groupPeople = selectedPeople.map(person => ({
      firstName: person.first_name,
      lastName: person.last_name,
      emailAddress: person.email || "",
    }));

    // Combine both selections, removing duplicates based on email
    const combinedPeople = [...people, ...groupPeople].reduce<Attendee[]>((acc, current) => {
      const x = acc.find(item => item.emailAddress === current.emailAddress);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    dispatch(updateFields({ attendees: combinedPeople }));
    next();
    router.push("/events/create/schedule");
  };

  useEffect(() => {
    if (steps[pageNum].route != pathname) {
      redirect(steps[pageNum].route);
    }
  }, [pageNum, pathname]);

  const totalSelected = Object.keys(csvRowSelection).length + selectedPeople.length;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Add Invitees
      </Typography>

      <Box className="space-y-8">
        <div>
          <Typography variant="h6" gutterBottom>
            Import from CSV
          </Typography>
          {step === 0 ? (
            <ImportStep
              next={() => setStep(1)}
              setData={(data) => {
                setCsvData(data);
              }}
            />
          ) : (
            <SelectStep
              data={csvData}
              rowSelection={csvRowSelection}
              setRowSelection={setCsvRowSelection}
            />
          )}
        </div>

        <div>
          <Typography variant="h6" gutterBottom>
            Select from Groups
          </Typography>
          <PeopleSelector onSelectionChange={setSelectedPeople} />
        </div>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Total Selected: {totalSelected} people
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {Object.keys(csvRowSelection).length} from CSV, {selectedPeople.length} from groups
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            onClick={() => {
              prev();
              router.push("/events/create/description");
            }}
          >
            Previous
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={totalSelected === 0}
          >
            Next
          </Button>
        </Box>
      </Box>
    </div>
  );
}

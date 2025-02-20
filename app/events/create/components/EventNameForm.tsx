"use client";
import { Button, TextField } from "@mui/material";
import { useMeetingFormContext } from "../meeting-form-provider";
import { useActionState } from "react";
import { eventNameFormAction } from "../../actions";

export default function EventNameForm() {
  const { formData, updateFields } = useMeetingFormContext();
  const [, formAction, isPending] = useActionState(eventNameFormAction, null);

  return (
    <form action={formAction}>
      <h1 className="text-center mt-3">What is the name of your event?</h1>
      <div className="flex flex-col gap-5 mt-5 items-center">
        <TextField
          required
          label="Event Name"
          variant="filled"
          placeholder="Type a descriptive name for your event here"
          value={formData.meetingName}
          sx={{ width: 1 / 2 }}
          onChange={(e) => updateFields({ meetingName: e.currentTarget.value })}
        />

        <div className="flex flex-row-reverse w-full">
          <Button type="submit" variant="contained" loading={isPending}>
            Next
          </Button>
        </div>
      </div>
    </form>
  );
}

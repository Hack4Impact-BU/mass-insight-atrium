"use client";
import { Button, TextField } from "@mui/material";
import { useEventFormContext } from "../event-form-provider";
import { useActionState } from "react";
import { descriptionFormAction } from "../../actions";
import { useRouter } from "next/navigation";

export default function DescriptionForm() {
  const { formData, updateFields, next, prev } = useEventFormContext();
  const [, formAction, isPending] = useActionState(descriptionFormAction, null);
  const router = useRouter();
  return (
    <form action={formAction}>
      <h1 className="text-center mt-3">Describe your event</h1>
      <div className="flex flex-col gap-5 mt-5 items-center">
        <TextField
          required
          label="Description"
          multiline
          minRows={10}
          variant="filled"
          placeholder="Describe your event here"
          value={formData.description}
          sx={{ width: 1 / 2 }}
          onChange={(e) => updateFields({ description: e.currentTarget.value })}
        />
        <div className="flex justify-between px-5 w-full">
          <Button
            type="button"
            variant="contained"
            loading={isPending}
            onClick={() => {
              prev();
              router.push("/events/create/start");
            }}
          >
            Previous
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={isPending}
            onClick={next}
          >
            Next
          </Button>
        </div>
      </div>
    </form>
  );
}

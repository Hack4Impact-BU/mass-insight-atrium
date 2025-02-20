"use client";
import { Button, TextField } from "@mui/material";
import { useMeetingFormContext } from "../meeting-form-provider";
import { useActionState } from "react";
import { descriptionFormAction } from "../../actions";
import { useRouter } from "next/navigation";

export default function DescriptionForm() {
  const { formData, updateFields, next, prev } = useMeetingFormContext();
  const [, formAction, isPending] = useActionState(descriptionFormAction, null);
  const router = useRouter();
  return (
    <form action={formAction}>
      <h1 className="text-center mt-3">Describe your meeting</h1>
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
            // can't exactly have 2 submit buttons because they both perform different actions and you can't pass in functions into formAction
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

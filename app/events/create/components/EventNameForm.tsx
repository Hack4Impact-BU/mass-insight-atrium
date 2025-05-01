"use client";
import { updateFields } from "@/lib/features/eventCreateForm/eventCreateFormSlice";
import { RootState } from "@/lib/store";
import { Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useProgressContext } from "../RedirectManager";

export default function EventNameForm() {
  const router = useRouter();
  const formData = useSelector((state: RootState) => state.eventCreateForm);
  const dispatch = useDispatch();

  const [, formAction, isPending] = useActionState(
    (_: void | null, data: FormData) => {
      // console.log(data.get("meeting-name") as string);
      dispatch(
        updateFields({ meetingName: data.get("meeting-name") as string })
      );
      // console.log(formData);
      next();
      router.push("/events/create/description");
    },
    null
  );
  const { next } = useProgressContext();
  // console.log(formData);
  return (
    <form action={formAction}>
      <h1 className="text-center mt-3">What is the name of your event?</h1>
      <div className="flex flex-col gap-5 mt-5 items-center">
        <TextField
          required
          label="Event Name"
          name="meeting-name"
          id="meeting-name"
          variant="filled"
          placeholder="Type a descriptive name for your event here"
          defaultValue={formData.meetingName}
          sx={{ width: 1 / 2 }}
        />

        <div className="flex flex-row-reverse w-full">
          <Button
            type="submit"
            variant="contained"
            loading={isPending}
            disabled={isPending || !formData.meetingName}
            // onClick={() => {dispatch(updateFields({ meetingName: "test name" })); console.log(formData)}}
          >
            Next
          </Button>
        </div>
      </div>
    </form>
  );
}

"use client";
import { Button, TextField } from "@mui/material";
import { useActionState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { updateFields } from "@/lib/features/eventCreateForm/eventCreateFormSlice";
import { useProgressContext } from "../RedirectManager";
import { redirect, usePathname, useRouter } from "next/navigation";
import { steps } from "../../utils";

export default function DescriptionForm() {
  const router = useRouter();
  const pathname = usePathname();
  const formData = useSelector((state: RootState) => state.eventCreateForm);
  const dispatch = useDispatch();
  const [, formAction, isPending] = useActionState(
    (_: void | null, formData: FormData) => {
      dispatch(
        updateFields({ description: formData.get("description") as string })
      );
      next();
      router.push("/events/create/import");
    },
    null
  );
  const { next, prev, pageNum } = useProgressContext();
  useEffect(() => {
    if (steps[pageNum].route != pathname) {
      redirect(steps[pageNum].route);
    }
  }, [pageNum, pathname]);
  return (
    <form action={formAction}>
      <h1 className="text-center mt-3">Describe your meeting</h1>
      <div className="flex flex-col gap-5 mt-5 items-center">
        <TextField
          required
          label="Description"
          id="description"
          name="description"
          multiline
          minRows={10}
          variant="filled"
          defaultValue={formData.description}
          placeholder="Describe your event here"
          sx={{ width: 1 / 2 }}
        />
        <div className="flex justify-between px-5 w-full">
          {/* can't have previous button as submit button because of the required constraint */}
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
          <Button type="submit" variant="contained" loading={isPending}>
            Next
          </Button>
        </div>
      </div>
    </form>
  );
}

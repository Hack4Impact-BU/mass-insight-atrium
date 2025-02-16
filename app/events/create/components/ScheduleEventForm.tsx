"use client";

import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useEventFormContext } from "../event-form-provider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useActionState } from "react";
import { scheduleFormAction } from "../../actions";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import TimezoneSelect from "./TimezoneSelect";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

export default function ScheduleEventForm() {
  const router = useRouter();
  const { formData, updateFields, next, prev } = useEventFormContext();
  const [, formAction, isPending] = useActionState(() => {
    scheduleFormAction(formData);
  }, null);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form action={formAction} className="mt-5">
        <h1 className="text-center text-3xl mb-5">Schedule your event</h1>
        <div className="flex flex-col gap-5">
          <TextField
            required
            label="Event Name"
            variant="filled"
            placeholder="Type a descriptive name for your event here"
            value={formData.name}
            onChange={(e) => updateFields({ name: e.currentTarget.value })}
          />
          <div className="flex gap-5 justify-center">
            <DateTimePicker
              label="Start Date"
              defaultValue={dayjs()}
              onChange={(e) => updateFields({ startDate: e?.valueOf() })}
            ></DateTimePicker>
            <DateTimePicker
              label="End Date"
              defaultValue={dayjs()}
              onChange={(e) => updateFields({ endDate: e?.valueOf() })}
            ></DateTimePicker>
            <TimezoneSelect />
          </div>

          <hr className="border-2"></hr>
          <h3 className="text-xl text-center">Event Details</h3>
          <div className="flex justify-center gap-5">
            <FormControl>
              <FormLabel>Location</FormLabel>
              <RadioGroup
                id="location"
                row
                value={formData.location}
                onChange={(e) => {
                  updateFields({
                    location: e.currentTarget.value as "online" | "in-person",
                  });
                  updateFields({
                    locationInfo: "",
                  });
                }}
              >
                <FormControlLabel
                  value="online"
                  label="Online"
                  control={<Radio></Radio>}
                ></FormControlLabel>
                <FormControlLabel
                  value="in-person"
                  label="In-person"
                  control={<Radio></Radio>}
                ></FormControlLabel>
              </RadioGroup>
            </FormControl>
            <TextField
              sx={{ width: 2 / 5 }}
              required
              label={
                formData.location == "online" ? "Event Link" : "Event Address"
              }
              variant="filled"
              placeholder={
                formData.location == "online"
                  ? "Link to the event"
                  : "Address to the event"
              }
              value={formData.locationInfo}
              onChange={(e) =>
                updateFields({ locationInfo: e.currentTarget.value })
              }
            />
          </div>
          <div className="flex justify-center">
            <TextField
              sx={{ width: 1 / 2 }}
              label="Description"
              multiline
              minRows={5}
              required
              value={formData.description}
              onChange={(e) =>
                updateFields({ description: e.currentTarget.value })
              }
              name="event-name"
              id="event-name"
              variant="outlined"
              placeholder="Type a descriptive description of your event here"
            ></TextField>
          </div>

          <div>
            <h3 className="text-center">Moderators</h3>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  updateFields({ moderators: [...formData.moderators, ""] });
                }}
              >
                Add
              </Button>
              <Button
                onClick={() => {
                  if (formData.moderators.length > 1) {
                    updateFields({
                      moderators: formData.moderators.slice(
                        0,
                        formData.moderators.length - 1
                      ),
                    });
                  }
                }}
              >
                Remove
              </Button>
            </div>
            <div className="flex justify-center gap-5 flex-wrap">
              {formData.moderators.map((moderator, index) => (
                <TextField
                  label={`Moderator ${index + 1}`}
                  key={index}
                  required
                  value={moderator}
                  onChange={(e) => {
                    const newState = [...formData.moderators];
                    newState[index] = e.currentTarget.value;
                    updateFields({ moderators: newState });
                  }}
                  name="event-name"
                  id="event-name"
                  variant="outlined"
                  placeholder="Name of moderator"
                ></TextField>
              ))}
            </div>
          </div>
          <hr className="border-2"></hr>
          <h2 className="text-lg text-center">Security</h2>
          <div className="flex flex-col items-end">
            <FormGroup>
              <FormControlLabel
                label="Waitlist"
                control={
                  <Checkbox
                    checked={formData.waitlist}
                    onChange={(e) =>
                      updateFields({ waitlist: e.currentTarget.checked })
                    }
                  ></Checkbox>
                }
              ></FormControlLabel>
            </FormGroup>
            {formData.waitlist && (
              <TextField
                required
                label="Attendee Cap"
                variant="filled"
                placeholder="Max number of attendees"
                value={formData.cap}
                onChange={(e) => {
                  if (!Number.isNaN(e.currentTarget.value)) {
                    if (e.currentTarget.value == "") {
                      updateFields({ cap: "" });
                    } else {
                      updateFields({ cap: parseInt(e.currentTarget.value) });
                    }
                  }
                }}
              />
            )}
          </div>
          <TextField
            required
            label="Passcode"
            type="password"
            variant="filled"
            placeholder="Type a descriptive name for your event here"
            value={formData.passcode}
            onChange={(e) => updateFields({ passcode: e.currentTarget.value })}
          />
        </div>

        <br></br>
        <div className="flex justify-between px-5">
          <Button
            type="button"
            variant="contained"
            loading={isPending}
            onClick={() => {
              prev();
              router.push("/events/create/description");
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
            Schedule Event
          </Button>
        </div>
      </form>
    </LocalizationProvider>
  );
}

"use client";

import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useMeetingFormContext } from "../meeting-form-provider";
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
  List,
  ListItem,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import TimezoneSelect from "./TimezoneSelect";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

export default function ScheduleEventForm() {
  const router = useRouter();
  const { formData, updateFields, next, prev } = useMeetingFormContext();
  const [, formAction, isPending] = useActionState(() => {
    scheduleFormAction(formData);
  }, null);
  const parsableInt = (s: string) => {
    const number = parseInt(s);
    if (Number.isNaN(number)) {
      return false;
    }
    return true;
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form action={formAction} className="mt-5">
        <h1 className="text-center text-3xl mb-5">Schedule your event</h1>
        <div className="flex flex-col gap-5">
          <TextField
            required
            label="Event Name"
            name="event-name"
            id="event-name"
            variant="filled"
            placeholder="Type a descriptive name for your event here"
            value={formData.meetingName}
            onChange={(e) =>
              updateFields({ meetingName: e.currentTarget.value })
            }
          />
          <div className="flex gap-5 justify-center">
            <DateTimePicker
              label="Start Date"
              name="start-date"
              value={dayjs(formData.startDate)}
              onChange={(e) => updateFields({ startDate: e?.toISOString() })}
            ></DateTimePicker>
            <DateTimePicker
              label="End Date"
              value={dayjs(formData.endDate)}
              onChange={(e) => updateFields({ endDate: e?.toISOString() })}
            ></DateTimePicker>
            <TimezoneSelect />
          </div>

          <hr className="border-2"></hr>
          <h3 className="text-xl text-center">Event Details</h3>
          <div className="flex justify-center items-center gap-5">
            <FormControl>
              <FormLabel>Location</FormLabel>
              <RadioGroup
                id="location"
                row
                value={formData.locationType}
                onChange={(e) => {
                  updateFields({
                    locationType: e.currentTarget.value as
                      | "online"
                      | "inperson"
                      | "both",
                  });
                }}
              >
                <FormControlLabel
                  value="online"
                  label="Online"
                  control={<Radio></Radio>}
                ></FormControlLabel>
                <FormControlLabel
                  value="inperson"
                  label="In-person"
                  control={<Radio></Radio>}
                ></FormControlLabel>
                <FormControlLabel
                  value="both"
                  label="Both"
                  control={<Radio></Radio>}
                ></FormControlLabel>
              </RadioGroup>
            </FormControl>
            <div className="flex flex-col gap-5">
              {(formData.locationType == "online" ||
                formData.locationType == "both") && (
                <TextField
                  required
                  label="Event Link"
                  variant="filled"
                  placeholder={"Link to the event"}
                  value={formData.meetingLink}
                  onChange={(e) =>
                    updateFields({ meetingLink: e.currentTarget.value })
                  }
                />
              )}
              {(formData.locationType == "inperson" ||
                formData.locationType == "both") && (
                <TextField
                  required
                  label="Event Address"
                  variant="filled"
                  placeholder={"Address to the event"}
                  value={formData.meetingAddress}
                  onChange={(e) =>
                    updateFields({ meetingAddress: e.currentTarget.value })
                  }
                />
              )}
            </div>
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
            <h3 className="text-center">Invitees</h3>
            <div className="flex justify-center">
              <List
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  maxHeight: 400,
                  overflow: "auto",
                }}
              >
                {formData.attendees.map((value, index) => (
                  <ListItem key={index}>
                    {value.firstName} {value.lastName} : {value.emailAddress}
                  </ListItem>
                ))}
              </List>
            </div>
          </div>
          <div>
            <h3 className="text-center">Moderators</h3>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  updateFields({
                    moderators: [
                      ...formData.moderators,
                      { firstName: "", lastName: "", emailAddress: "" },
                    ],
                  });
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
                <div key={index} className="flex flex-col gap-2">
                  <TextField
                    label={`Moderator ${index + 1} first name`}
                    required
                    value={moderator.firstName}
                    onChange={(e) => {
                      const newState = [...formData.moderators];
                      newState[index]["firstName"] = e.currentTarget.value;
                      updateFields({ moderators: newState });
                    }}
                    name={`moderator-${index + 1}-first-name`}
                    id={`moderator-${index + 1}-first-name`}
                    variant="outlined"
                    placeholder="First name of moderator"
                  ></TextField>
                  <TextField
                    label={`Moderator ${index + 1} last name`}
                    required
                    value={moderator.lastName}
                    onChange={(e) => {
                      const newState = [...formData.moderators];
                      newState[index]["lastName"] = e.currentTarget.value;
                      updateFields({ moderators: newState });
                    }}
                    name={`moderator-${index + 1}-last-name`}
                    id={`moderator-${index + 1}-last-name`}
                    variant="outlined"
                    placeholder="Last Name of moderator"
                  ></TextField>
                  <TextField
                    label={`Moderator ${index + 1} email`}
                    required
                    type="email"
                    value={moderator.emailAddress}
                    onChange={(e) => {
                      const newState = [...formData.moderators];
                      newState[index]["emailAddress"] = e.currentTarget.value;
                      updateFields({ moderators: newState });
                    }}
                    name={`moderator-${index + 1}-email`}
                    id={`moderator-${index + 1}-email`}
                    variant="outlined"
                    placeholder="Name of moderator"
                  ></TextField>
                </div>
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
                      if (parsableInt(e.currentTarget.value)) {
                        updateFields({ cap: parseInt(e.currentTarget.value) });
                      }
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
          {/* // again, can't exactly have 2 submit buttons because they both perform different actions and you can't pass in functions into formAction */}
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

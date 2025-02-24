"use client";

import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
import { redirect, usePathname, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  addMod,
  removeMod,
  updateFields,
  updateModeratorFields,
} from "@/lib/features/eventCreateForm/eventCreateFormSlice";
import { useActionState, useEffect } from "react";
import { scheduleFormAction } from "../../actions";
import { steps } from "../../utils";
import { useProgressContext } from "../RedirectManager";

export default function ScheduleEventForm() {
  const router = useRouter();
  const formData = useSelector((state: RootState) => state.eventCreateForm);
  const dispatch = useDispatch();

  const [, formAction, isPending] = useActionState(
    (_: void | null, data: FormData) => {
      dispatch(
        updateFields({
          meetingName: data.get("meeting-name") as string,
          startDate: new Date(data.get("start-date") as string).toISOString(),
          endDate: new Date(data.get("end-date") as string).toISOString(),
          locationType: data.get("location") as "online" | "inperson" | "both",
          meetingAddress: data.get("meeting-address") as string,
          meetingLink: data.get("meeting-link") as string,
          description: data.get("description") as string,
          meetingDetails: data.get("meeting-details") as string,
        })
      );
      scheduleFormAction(formData);
    },
    null
  );
  const parsableInt = (s: string) => {
    const number = parseInt(s);
    if (Number.isNaN(number)) {
      return false;
    }
    return true;
  };
  const pathname = usePathname();
  const { pageNum } = useProgressContext();
  useEffect(() => {
    if (steps[pageNum].route != pathname) {
      redirect(steps[pageNum].route);
    }
  }, [pageNum, pathname]);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form className="mt-5" action={formAction}>
        <h1 className="text-center text-3xl mb-5">Schedule your event</h1>
        <div className="flex flex-col gap-5">
          <TextField
            required
            label="Event Name"
            name="event-name"
            id="event-name"
            variant="filled"
            placeholder="Type a descriptive name for your event here"
            defaultValue={formData.meetingName}
          />
          <div className="flex gap-5 justify-center">
            <DateTimePicker
              label="Start Date"
              name="start-date"
              defaultValue={dayjs(formData.startDate)}
            ></DateTimePicker>
            <DateTimePicker
              label="End Date"
              defaultValue={dayjs(formData.endDate)}
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
                name="location"
                row
                defaultValue={formData.locationType}
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
                  name="meeting-link"
                  id="meeting-link"
                  variant="filled"
                  placeholder={"Link to the event"}
                  defaultValue={formData.meetingLink}
                />
              )}
              {(formData.locationType == "inperson" ||
                formData.locationType == "both") && (
                <TextField
                  required
                  label="Event Address"
                  variant="filled"
                  id="meeting-address"
                  name="meeting-address"
                  placeholder={"Address to the event"}
                  defaultValue={formData.meetingAddress}
                />
              )}
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <TextField
              sx={{ width: 1 / 2 }}
              label="Description"
              multiline
              minRows={5}
              required
              defaultValue={formData.description}
              name="description"
              id="description"
              variant="outlined"
              placeholder="Type a descriptive description of your event here"
            ></TextField>
            <TextField
              sx={{ width: 1 / 2 }}
              label="Meeting Details"
              multiline
              minRows={5}
              required
              defaultValue={formData.meetingDetails}
              name="meeting-details"
              id="meeting-details"
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
                  dispatch(addMod());
                }}
              >
                Add
              </Button>
              <Button
                onClick={() => {
                  console.log(formData.moderators.length);
                  if (formData.moderators.length > 1) {
                    dispatch(removeMod());
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
                    onChange={(e) =>
                      dispatch(
                        updateModeratorFields({
                          field: "firstName",
                          value: e.currentTarget.value,
                          index: index,
                        })
                      )
                    }
                    name={`moderator[${index}][first_name]`}
                    id={`moderator[${index}][first_name]`}
                    variant="outlined"
                    placeholder="First name of moderator"
                  ></TextField>
                  <TextField
                    label={`Moderator ${index + 1} last name`}
                    required
                    value={moderator.lastName}
                    onChange={(e) =>
                      dispatch(
                        updateModeratorFields({
                          field: "lastName",
                          value: e.currentTarget.value,
                          index: index,
                        })
                      )
                    }
                    name={`moderator[${index}][last_name]`}
                    id={`moderator[${index}][last_name]`}
                    variant="outlined"
                    placeholder="Last Name of moderator"
                  ></TextField>
                  <TextField
                    label={`Moderator ${index + 1} email`}
                    required
                    type="email"
                    value={moderator.emailAddress}
                    onChange={(e) =>
                      dispatch(
                        updateModeratorFields({
                          field: "emailAddress",
                          value: e.currentTarget.value,
                          index: index,
                        })
                      )
                    }
                    name={`moderator[${index}][email]`}
                    id={`moderator[${index}][email]`}
                    variant="outlined"
                    placeholder="Email of moderator"
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
                      dispatch(
                        updateFields({ waitlist: e.currentTarget.checked })
                      )
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
                      dispatch(updateFields({ cap: "" }));
                    } else {
                      if (parsableInt(e.currentTarget.value)) {
                        dispatch(
                          updateFields({ cap: parseInt(e.currentTarget.value) })
                        );
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
            defaultValue={formData.passcode}
            onChange={(e) => updateFields({ passcode: e.currentTarget.value })}
          />
        </div>

        <br></br>
        <div className="flex justify-between px-5">
          <Button
            type="button"
            variant="contained"
            onClick={() => router.push("/events/create/import")}
            loading={isPending}
          >
            Previous
          </Button>
          <Button type="submit" variant="contained" loading={isPending}>
            Schedule Event
          </Button>
        </div>
      </form>
    </LocalizationProvider>
  );
}

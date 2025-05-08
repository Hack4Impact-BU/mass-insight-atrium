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
  Paper,
  Box,
  Typography,
  Divider,
  Stack,
  CircularProgress,
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
import { useActionState, useEffect, useState } from "react";
import { scheduleFormAction } from "../../actions";
import { steps } from "../../utils";
import { useProgressContext } from "../RedirectManager";
import { PersonSchema } from "@/lib/features/eventCreateForm/eventCreateFormSlice";
import { z } from "zod";

export default function ScheduleEventForm() {
  const router = useRouter();
  const formData = useSelector((state: RootState) => state.eventCreateForm);
  const dispatch = useDispatch();
  const { pageNum, prev } = useProgressContext();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handlePrevious = () => {
    if (pageNum > 0) {
      prev();
      router.push(steps[pageNum - 1].route);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formDataObj = new FormData(e.target as HTMLFormElement);
      await scheduleFormAction(formData);
      router.push("/events/create/confirm");
    } catch (error) {
      setSubmitError("Failed to schedule event. Please try again.");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form className="mt-5" onSubmit={handleSubmit}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, mx: 'auto', borderRadius: 2 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Schedule your event
          </Typography>
          
          <Stack spacing={4}>
            {/* Event Name */}
            <Box>
          <TextField
            required
            label="Event Name"
            name="event-name"
            id="event-name"
                variant="outlined"
                fullWidth
            placeholder="Type a descriptive name for your event here"
            defaultValue={formData.meetingName}
                sx={{ mb: 2 }}
          />
            </Box>

            {/* Date and Time Selection */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Date and Time</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <DateTimePicker
              label="Start Date"
              name="start-date"
              defaultValue={dayjs(formData.startDate)}
                  sx={{ flex: 1 }}
                />
            <DateTimePicker
              label="End Date"
              defaultValue={dayjs(formData.endDate)}
                  sx={{ flex: 1 }}
                />
            <TimezoneSelect />
              </Stack>
            </Paper>

            {/* Event Details */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Event Details</Typography>
              <Stack spacing={3}>
            <FormControl>
                  <FormLabel>Location Type</FormLabel>
              <RadioGroup
                id="location"
                name="location"
                row
                defaultValue={formData.locationType}
                    sx={{ justifyContent: 'center', gap: 2 }}
              >
                <FormControlLabel
                  value="online"
                  label="Online"
                  control={
                    <Radio
                          onClick={() => dispatch(updateFields({ locationType: "online" }))}
                        />
                      }
                    />
                <FormControlLabel
                  value="inperson"
                  label="In-person"
                  control={
                    <Radio
                          onClick={() => dispatch(updateFields({ locationType: "inperson" }))}
                        />
                      }
                    />
                <FormControlLabel
                  value="both"
                  label="Both"
                  control={
                    <Radio
                          onClick={() => dispatch(updateFields({ locationType: "both" }))}
                        />
                      }
                    />
              </RadioGroup>
            </FormControl>

                <Stack spacing={2}>
                  {(formData.locationType == "online" || formData.locationType == "both") && (
                <TextField
                  required
                  label="Event Link"
                  name="meeting-link"
                  id="meeting-link"
                      variant="outlined"
                      fullWidth
                      placeholder="Link to the event"
                  defaultValue={formData.meetingLink}
                />
              )}
                  {(formData.locationType == "inperson" || formData.locationType == "both") && (
                <TextField
                  required
                  label="Event Address"
                      variant="outlined"
                  id="meeting-address"
                  name="meeting-address"
                      fullWidth
                      placeholder="Address to the event"
                  defaultValue={formData.meetingAddress}
                />
              )}
                </Stack>
              </Stack>
            </Paper>

            {/* Description and Meeting Details */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Event Information</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <TextField
              label="Description"
              multiline
              minRows={5}
              required
              defaultValue={formData.description}
              name="description"
              id="description"
              variant="outlined"
                  fullWidth
              placeholder="Type a descriptive description of your event here"
                />
            <TextField
              label="Meeting Details"
              multiline
              minRows={5}
              required
              defaultValue={formData.meetingDetails}
              name="meeting-details"
              id="meeting-details"
              variant="outlined"
                  fullWidth
              placeholder="Type a descriptive description of your event here"
                />
              </Stack>
            </Paper>

            {/* Invitees */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Invitees</Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List>
                {formData.attendees.map((value: z.infer<typeof PersonSchema>, index: number) => (
                    <ListItem key={index} sx={{ borderBottom: '1px solid #eee' }}>
                    {value.firstName} {value.lastName} : {value.emailAddress}
                  </ListItem>
                ))}
              </List>
              </Box>
            </Paper>

            {/* Moderators */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Moderators</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                  variant="contained"
                  onClick={() => dispatch(addMod())}
              >
                  Add Moderator
              </Button>
              <Button
                  variant="outlined"
                onClick={() => {
                  if (formData.moderators.length > 1) {
                    dispatch(removeMod());
                  }
                }}
              >
                  Remove Moderator
              </Button>
              </Stack>
              <Stack spacing={3}>
              {formData.moderators.map((moderator: z.infer<typeof PersonSchema>, index: number) => (
                  <Stack key={index} direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
                      fullWidth
                    />
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
                      fullWidth
                    />
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
                      fullWidth
                    />
                  </Stack>
              ))}
              </Stack>
            </Paper>
          </Stack>
        </Paper>

        {submitError && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography color="error">{submitError}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, px: 5 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={handlePrevious}
            disabled={isSubmitting}
            sx={{ minWidth: 120 }}
          >
            Previous
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isSubmitting}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Scheduling...
              </Box>
            ) : 'Schedule Event'}
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
}

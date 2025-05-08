import { createSlice, createSelector } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { z } from "zod";

// Validation schema for attendee/moderator
const PersonSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  emailAddress: z.string().email("Invalid email address"),
});

// Validation schema for the entire form
export const EventCreateFormSchema = z.object({
  meetingName: z.string().min(1, "Meeting name is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  locationType: z.enum(["online", "inperson", "both"]),
  meetingAddress: z.string().optional(),
  meetingLink: z.string().url("Invalid meeting link").optional(),
  passcode: z.string().min(6, "Passcode must be at least 6 characters").optional(),
  moderators: z.array(PersonSchema).min(1, "At least one moderator is required"),
  attendees: z.array(PersonSchema),
  waitlist: z.boolean(),
  cap: z.number().min(0, "Capacity must be a positive number").optional(),
  timezone: z.string(),
  meetingDetails: z.string().optional(),
});

export type EventCreateFormState = z.infer<typeof EventCreateFormSchema> & {
  validationErrors: Record<string, string[]>;
  isDirty: boolean;
  isSubmitting: boolean;
  lastSaved: string | null;
};

const initialState: EventCreateFormState = {
  meetingName: "",
  description: "",
  startDate: dayjs().toISOString(),
  endDate: dayjs().toISOString(),
  locationType: "online",
  meetingAddress: "",
  meetingLink: "",
  passcode: "",
  waitlist: false,
  cap: 0,
  attendees: [],
  moderators: [{ firstName: "", lastName: "", emailAddress: "" }],
  timezone: "-05:00",
  meetingDetails: "",
  validationErrors: {},
  isDirty: false,
  isSubmitting: false,
  lastSaved: null,
};

export const eventCreateFormSlice = createSlice({
  name: "eventCreateForm",
  initialState,
  reducers: {
    updateFields: (
      state,
      action: PayloadAction<Partial<EventCreateFormState>>
    ) => {
      // Validate the updated fields
      try {
        const updatedState = { ...state, ...action.payload };
        EventCreateFormSchema.parse(updatedState);
        state.validationErrors = {};
        state.isDirty = true;
        return { ...state, ...action.payload };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, string[]> = {};
          error.errors.forEach((err) => {
            const path = err.path.join(".");
            if (!errors[path]) {
              errors[path] = [];
            }
            errors[path].push(err.message);
          });
          state.validationErrors = errors;
        }
        return { ...state, ...action.payload, isDirty: true };
      }
    },
    updateModeratorFields: (
      state,
      action: PayloadAction<{
        field: "firstName" | "lastName" | "emailAddress";
        value: string;
        index: number;
      }>
    ) => {
      const { field, value, index } = action.payload;
      if (index >= 0 && index < state.moderators.length) {
        state.moderators[index] = {
          ...state.moderators[index],
          [field]: value,
        };
        state.isDirty = true;
        
        // Validate the updated moderator
        try {
          PersonSchema.parse(state.moderators[index]);
          delete state.validationErrors[`moderators.${index}.${field}`];
        } catch (error) {
          if (error instanceof z.ZodError) {
            const fieldErrors = error.errors
              .filter(err => err.path.includes(field))
              .map(err => err.message);
            if (fieldErrors.length > 0) {
              state.validationErrors[`moderators.${index}.${field}`] = fieldErrors;
            }
          }
        }
      }
    },
    addMod: (state) => {
      state.moderators.push({ firstName: "", lastName: "", emailAddress: "" });
      state.isDirty = true;
    },
    removeMod: (state) => {
      if (state.moderators.length > 1) {
        state.moderators.pop();
        state.isDirty = true;
      }
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    setLastSaved: (state, action: PayloadAction<string>) => {
      state.lastSaved = action.payload;
      state.isDirty = false;
    },
    resetForm: () => initialState,
    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },
  },
});

// Selectors
export const selectFormState = (state: { eventCreateForm: EventCreateFormState }) =>
  state.eventCreateForm;

export const selectFormValidation = createSelector(
  selectFormState,
  (formState) => {
    try {
      EventCreateFormSchema.parse(formState);
      return { isValid: true, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, errors: error.errors };
      }
      return { isValid: false, errors: null };
    }
  }
);

export const selectModerators = createSelector(
  selectFormState,
  (formState) => formState.moderators
);

export const selectValidationErrors = createSelector(
  selectFormState,
  (formState) => formState.validationErrors
);

export const selectFormStatus = createSelector(
  selectFormState,
  (formState) => ({
    isDirty: formState.isDirty,
    isSubmitting: formState.isSubmitting,
    lastSaved: formState.lastSaved,
  })
);

export const {
  updateFields,
  addMod,
  removeMod,
  updateModeratorFields,
  resetForm,
  setSubmitting,
  setLastSaved,
  clearValidationErrors,
} = eventCreateFormSlice.actions;

export default eventCreateFormSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";

export interface EventCreateFormState {
  meetingName: string;
  description: string;
  startDate: string;
  endDate: string;
  locationType: "online" | "inperson" | "both";
  meetingAddress: string;
  meetingLink: string;
  passcode: string; // hashed with bcrypt when sending to database
  moderators: { firstName: string; lastName: string; emailAddress: string }[];
  attendees: { firstName: string; lastName: string; emailAddress: string }[];
  waitlist: boolean;
  cap: number | "";
  timezone: string;
  meetingDetails: string;
}

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
};

export const eventCreateFormSlice = createSlice({
  name: "eventCreateForm",
  initialState,
  reducers: {
    updateFields: (
      state,
      action: PayloadAction<Partial<EventCreateFormState>>
    ) => {
      return { ...state, ...action.payload };
      // console.log(`action.payload = ${action.payload}`);
      // console.log(action.payload)
      // console.log(`combined = ${{ ...state, ...action.payload }}`);
    },
    updateModeratorFields: (
      state,
      action: PayloadAction<{
        field: "firstName" | "lastName" | "emailAddress";
        value: string;
        index: number;
      }>
    ) => {
      state.moderators[action.payload.index][action.payload.field] =
        action.payload.value;
    },
    addMod: (state) => {
      state.moderators.push({ firstName: "", lastName: "", emailAddress: "" });
    },
    removeMod: (state) => {
      console.log(`moderator length = ${state.moderators.length}`);
      state.moderators.pop();
    },
  },
});

export const { updateFields, addMod, removeMod, updateModeratorFields } =
  eventCreateFormSlice.actions;
export default eventCreateFormSlice.reducer;

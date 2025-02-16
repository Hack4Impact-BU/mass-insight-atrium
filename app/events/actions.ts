"use server";
import { redirect } from "next/navigation";
import { EventCreateFormDataType } from "./create/event-form-provider";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/utils/supabase/types";
import bcrypt from 'bcrypt'
export const eventNameFormAction = async () => {
  redirect("/events/create/description");
};

export const descriptionFormAction = async () => {
  redirect("/events/create/schedule");
};

export const scheduleFormAction = async (formData: EventCreateFormDataType) => {
//   const supabase = await createClient();
  // const { error } = await supabase.from('meetings').insert({ name: formData.name, description: formData.description, start_time: formData.startDate, end_time: formData.endDate, waitlist: formData.waitlist, location: formData.location, location_info: formData.locationInfo, passcode: bcrypt.hash(formData.passcode, await bcrypt.genSalt()), cap: formData.cap})
  redirect("/");
};

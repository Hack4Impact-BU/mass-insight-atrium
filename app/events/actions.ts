"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
// import { MeetingCreateFormDataType } from "./create/meeting-form-provider";
import bcrypt from "bcrypt";
import { EventCreateFormState } from "@/lib/features/eventCreateForm/eventCreateFormSlice";
export const eventNameFormAction = async () => {
  redirect("/events/create/description");
};

export const descriptionFormAction = async () => {
  redirect("/events/create/import");
};

export const importFormAction = async () => {
  redirect("/events/create/schedule");
};

export const scheduleFormAction = async (formData: EventCreateFormState) => {
  if (formData.endDate < formData.startDate) {
    console.log(`Error with error endDate < startDate`);
    redirect("/events/create/schedule");
  }
  const supabase = await createClient();
  const { error, data } = await supabase
    .from("meetings")
    .upsert({
      cap: formData.cap as number,
      description: formData.description,
      encrypted_passcode: await bcrypt.hash(
        formData.passcode,
        await bcrypt.genSalt()
      ),
      end_time: formData.endDate, // will always exist because it's always set to the current day by default
      location_type: formData.locationType.toUpperCase() as
        | "INPERSON"
        | "ONLINE"
        | "BOTH",
      meeting_address: formData.meetingAddress,
      meeting_link: formData.meetingLink,
      start_time: formData.startDate, // will always exist because it's set to the current date by default
      waitlist: formData.waitlist,
      name: formData.meetingName,
      details: formData.meetingDetails,
    })
    .select();
  if (error) {
    console.log(`Error with error ${error.message}`);
    redirect("/events/create/schedule");
  }
  for (const invitee of formData.attendees) {
    const { error } = await supabase.from("invitees").upsert({
      email_address: invitee.emailAddress,
      first_name: invitee.firstName,
      last_name: invitee.lastName,
      is_moderator: false,
      status: "INVITED",
      meeting_id: data[0]["meeting_id"],
    });
    if (error) {
      console.log(`Error with error ${error.message}`);
      redirect("/events/create/schedule");
    }
  }
  for (const moderator of formData.moderators) {
    const { error } = await supabase.from("invitees").upsert({
      email_address: moderator.emailAddress,
      first_name: moderator.firstName,
      last_name: moderator.lastName,
      is_moderator: true,
      status: "INVITED",
      meeting_id: data[0]["meeting_id"],
    });
    if (error) {
      console.log(`Error with error ${error.message}`);
      redirect("/events/create/schedule");
    }
  }
  console.log(formData);

  redirect("/");
};

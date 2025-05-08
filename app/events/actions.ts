"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
// import { MeetingCreateFormDataType } from "./create/meeting-form-provider";
import bcrypt from "bcrypt";
import { EventCreateFormState } from "@/lib/features/eventCreateForm/eventCreateFormSlice";
import { Database } from "@/utils/supabase/types";

type MeetingInsert = Database["public"]["Tables"]["meetings"]["Insert"];

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
    throw new Error("End date cannot be before start date");
  }

  const supabase = await createClient();

  try {
    console.log("Starting meeting creation with data:", {
      name: formData.meetingName,
      startTime: formData.startDate,
      endTime: formData.endDate,
      locationType: formData.locationType,
      attendeesCount: formData.attendees.length,
      moderatorsCount: formData.moderators.length
    });

    // Prepare the meeting data
    const meetingInsertData: MeetingInsert = {
      cap: formData.cap ?? null,
      description: formData.description,
      end_time: formData.endDate,
      location_type: formData.locationType.toUpperCase() as Database["public"]["Enums"]["location_type"],
      meeting_address: formData.meetingAddress ?? null,
      meeting_link: formData.meetingLink ?? null,
      start_time: formData.startDate,
      waitlist: formData.waitlist,
      name: formData.meetingName,
      details: formData.meetingDetails ?? null,
    };

    // Only add encrypted passcode if it exists
    if (formData.passcode) {
      meetingInsertData.encrypted_passcode = await bcrypt.hash(
        formData.passcode,
        await bcrypt.genSalt()
      );
    }

    // Start a transaction
    const { error: meetingError, data: meetingResult } = await supabase
      .from("meetings")
      .upsert(meetingInsertData)
      .select();

    if (meetingError) {
      console.error("Meeting creation error:", meetingError);
      throw new Error(`Failed to create meeting: ${meetingError.message}`);
    }

    if (!meetingResult || meetingResult.length === 0) {
      throw new Error("Failed to create meeting: No data returned");
    }

    const meetingId = meetingResult[0].meeting_id;
    console.log("Meeting created successfully with ID:", meetingId);

    // Add attendees
    console.log("Adding attendees:", formData.attendees);
    for (const invitee of formData.attendees) {
      const { error: inviteeError } = await supabase.from("invitees").upsert({
        email_address: invitee.emailAddress,
        first_name: invitee.firstName,
        last_name: invitee.lastName,
        is_moderator: false,
        status: "INVITED",
        meeting_id: meetingId,
      });

      if (inviteeError) {
        console.error("Attendee addition error:", {
          error: inviteeError,
          attendee: invitee
        });
        throw new Error(`Failed to add attendee ${invitee.emailAddress}: ${inviteeError.message}`);
      }
    }

    // Add moderators
    console.log("Adding moderators:", formData.moderators);
    for (const moderator of formData.moderators) {
      const { error: moderatorError } = await supabase.from("invitees").upsert({
        email_address: moderator.emailAddress,
        first_name: moderator.firstName,
        last_name: moderator.lastName,
        is_moderator: true,
        status: "INVITED",
        meeting_id: meetingId,
      });

      if (moderatorError) {
        console.error("Moderator addition error:", {
          error: moderatorError,
          moderator: moderator
        });
        throw new Error(`Failed to add moderator ${moderator.emailAddress}: ${moderatorError.message}`);
      }
    }

    console.log("Form submission completed successfully");
    redirect(`/events/create/confirm?meetingId=${meetingId}`);
  } catch (error) {
    console.error("Form submission error:", {
      error,
      formData: {
        meetingName: formData.meetingName,
        attendeesCount: formData.attendees.length,
        moderatorsCount: formData.moderators.length
      }
    });
    throw error;
  }
};

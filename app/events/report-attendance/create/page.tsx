"use client";

import { useFile } from "@/utils/upload-data/file-context";
import { Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Create() {
  const { setMeetingId } = useFile();
  const [meeting, setMeeting] = useState("");
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-5">
      <h1>What is the Meeting ID of your zoom meeting?</h1>
      <TextField
        required
        value={meeting}
        onChange={(e) => setMeeting(e.currentTarget.value)}
      ></TextField>
      <Button
        onClick={() => {
          setMeetingId(meeting);
          router.push("/events/report-attendance/upload");
        }}
      >
        Next
      </Button>
    </div>
  );
}

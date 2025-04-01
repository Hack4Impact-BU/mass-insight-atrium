"use client";

import { createClient } from "@/utils/supabase/client";
import { Database } from "@/utils/supabase/types";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
const supabase = createClient();
export default function Page() {
  const [meetingData, setMeetingData] = useState<
    Database["public"]["Tables"]["meetings"]["Row"][] | null
  >([]);
  const router = useRouter();
  useEffect(() => {
    async function getMeetings() {
      const { data } = await supabase.from("meetings").select();
      setMeetingData(data);
    }
    getMeetings();
  }, []);

  return (
    <>
      <h1 className="text-center p-4 text-3xl">View meetings created</h1>
      <div className="flex items-center justify-center gap-8 p-8">
        {meetingData?.map((entry, index) => (
          <Button
            variant="outlined"
            key={index}
            onClick={() => router.push(`/events/view/${entry.meeting_id}`)}
          >
            <div className="flex flex-col">
              {entry.name}
              <hr></hr>
              {entry.description}
            </div>
          </Button>
        ))}

        <Button
          variant="outlined"
          onClick={() => router.push("/events/create/start")}
        >
          <div className="flex flex-col">
            <div className="flex justify-center">
              <Add></Add>
            </div>
            <hr></hr>
            Create New Meeting
          </div>
        </Button>
      </div>
    </>
  );
}

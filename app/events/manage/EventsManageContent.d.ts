import type { Database } from "@/utils/supabase/types";

declare const EventsManageContent: React.FC<{
  meetingData?: Database["public"]["Tables"]["meetings"]["Row"][] | null;
}>;

export default EventsManageContent; 
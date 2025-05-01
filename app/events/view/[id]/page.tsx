"use client";
import { useParams } from "next/navigation";
import { Box, Container } from "@mui/material";
import { Database } from "@/utils/supabase/types";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { EventOverview } from "./components/EventOverview";

const supabase = createClient();

export default function Page() {
  const params = useParams<{ id: string }>();
  const [inviteeData, setInviteeData] = useState<
    | {
        email_address: string;
        first_name: string;
        is_moderator: string;
        last_name: string | null;
        status: Database["public"]["Enums"]["attendee_status"];
      }[]
    | undefined
  >([]);

  const getColumns = (
    inviteeData:
      | {
          email_address: string;
          first_name: string;
          is_moderator: string;
          last_name: string | null;
          status: Database["public"]["Enums"]["attendee_status"];
        }[]
      | undefined
  ): any[] => {
    if (inviteeData !== undefined && inviteeData.length > 0) {
      let columns: {
        header: string;
        accessorKey: string;
        filterVariant: string;
      }[] = [];
      const row = Object.keys(inviteeData[0]);
      row.map((value) => {
        columns.push({
          header: value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          accessorKey: value,
          filterVariant: "text",
        });
      });
      return columns;
    } else {
      return [];
    }
  };

  useEffect(() => {
    async function getMeetings() {
      const { data } = await supabase
        .from("invitees")
        .select()
        .eq("meeting_id", parseInt(params.id));
      setInviteeData(
        data?.map((item) => {
          const { meeting_id, invitee_id, ...others } = item;
          return { ...others, is_moderator: item.is_moderator.toString() };
        })
      );
    }
    getMeetings();
  }, [params.id]);

  const columns = getColumns(inviteeData);
  const table = useMaterialReactTable({
    data: inviteeData ? inviteeData : [],
    columns: columns,
    enableRowSelection: true,
    enableBatchRowSelection: true,
    initialState: {
      density: 'compact',
      sorting: [{ id: 'status', desc: false }],
    },
  });

  return (
    <Container maxWidth="xl">
      <EventOverview meetingId={params.id} />
      <Box sx={{ mt: 2 }}>
        {inviteeData !== undefined && inviteeData && (
          <MaterialReactTable table={table} />
        )}
      </Box>
    </Container>
  );
}

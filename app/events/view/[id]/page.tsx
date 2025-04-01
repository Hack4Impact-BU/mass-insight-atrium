"use client";
import { useParams } from "next/navigation";
import { HotTable } from "@handsontable/react-wrapper";
import "handsontable/dist/handsontable.full.min.css";
import { Database } from "@/utils/supabase/types";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
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
          header: value,
          accessorKey: value,
          filterVariant: "text",
        });
      });
      return columns;
    } else {
      console.log("reached");
      return [];
    }
  };
  const columns = getColumns(inviteeData);
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
  }, []);
  console.log(columns.length);
  const table = useMaterialReactTable({
    data: inviteeData ? inviteeData : [],
    columns: columns,
    enableRowSelection: true,
    enableBatchRowSelection: true,
  });
  return (
    <>
      {inviteeData !== undefined && inviteeData && (
        <MaterialReactTable table={table}></MaterialReactTable>
      )}
    </>
  );
}

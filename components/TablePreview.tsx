"use client";
import { HotTable } from "@handsontable/react-wrapper";
import "handsontable/dist/handsontable.full.min.css";

import { registerAllModules } from "handsontable/registry";
export default function TablePreview({
  fileData,
  file,
}: {
  fileData: any[] | null;
  file: File | null;
}) {
  if (!fileData || fileData.length === 0) {
    return <p>No data found</p>;
  }
  const columns = Object.keys(fileData[0]);
  const columnSettings = columns.map((key) => ({
    data: key,
    title: key.charAt(0) + key.slice(1),
    width: 150,
  }));

  return (
    <HotTable
      data={fileData}
      colHeaders={columns} // Show headers from keys
      columns={columnSettings} // Map JSON keys to columns
      rowHeaders={true}
      dropdownMenu={[
        "filter_by_condition",
        "filter_by_value",
        "filter_action_bar",
      ]}
      columnSorting={true}
      filters={true}
      stretchH="all"
      licenseKey="non-commercial-and-evaluation"
      width="400px"
      height="200px"
      readOnly={true}
      preventOverflow={true}
    />
  );
}

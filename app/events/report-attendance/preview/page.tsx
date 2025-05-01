// app/view-data/page.tsx
"use client";

import { useFile } from "@/utils/upload-data/file-context";
import { useState } from "react";
import { Typography, Button, CircularProgress, Alert, Snackbar } from "@mui/material";

import { HotTable } from "@handsontable/react-wrapper";
import "handsontable/dist/handsontable.full.min.css";

import { registerAllModules } from "handsontable/registry";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
// Register all Handsontable modules (including filters)
registerAllModules();

export default function Preview() {
  const { fileData, meetingId } = useFile();
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!fileData || fileData.length === 0) {
    return <p className="text-center mt-10">No data to display</p>;
  }

  // Extract column keys from fileData
  const columns = Object.keys(fileData[0]);
  const columnSettings = columns.map((key) => ({
    data: key,
    title: key.charAt(0) + key.slice(1),
    width: 150,
  }));
  const uploadToSupabase = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, get all attendees from the file
      const attendeeEmails = fileData.map(row => row["User Email"]);
      
      // Update all matching invitees to PARTICIPATED status
      const { error: updateError } = await supabase
        .from("invitees")
        .update({ status: "PARTICIPATED" })
        .eq("meeting_id", parseInt(meetingId))
        .in("email_address", attendeeEmails);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="w-full">
        <div className="flex flex-col items-center justify-between min-h-screen py-10 bg-gray-100">
          {/* Title Section */}
          <Typography variant="h4" className="font-extrabold mb-2">
            Review Attendance Data
          </Typography>
          {error && error}
          {/* Spreadsheet Section */}
          <div className="flex flex-col items-center gap-10 mt-10">
            <div className="overflow-auto border border-gray-300 rounded-lg">
              {fileData ? (
                <div className="w-full flex-grow" style={{ minWidth: "800px" }}>
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
                    width="1400"
                    height="600px"
                  />
                </div>
              ) : (
                <p className="text-center text-gray-500">No file uploaded</p>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between w-full max-w-4xl mt-5">
            <Button
              variant="outlined"
              onClick={() => router.push("/events/report-attendance/upload")}
              disabled={loading}
            >
              <Typography className="normal-case p-3">Back</Typography>
            </Button>

            <Button
              variant="contained"
              onClick={uploadToSupabase}
              disabled={!fileData || loading}
              sx={{ position: 'relative' }}
            >
              <Typography className="normal-case p-3">
                {loading ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                      }}
                    />
                    Updating...
                  </>
                ) : (
                  'Upload'
                )}
              </Typography>
            </Button>
          </div>
        </div>
      </div>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={success} 
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success">
          Attendance updated successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

"use client";

import { createClient } from "@/utils/supabase/client";
import { Database } from "@/utils/supabase/types";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Paper, IconButton, CircularProgress, Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Add, Edit, Delete } from "@mui/icons-material";
import dayjs from "dayjs";
import { useLoading } from "@/app/providers/LoadingProvider";

const supabase = createClient();

export default function Page() {
  const [meetingData, setMeetingData] = useState<Database["public"]["Tables"]["meetings"]["Row"][] | null>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Database["public"]["Tables"]["meetings"]["Row"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    start_time: "",
    end_time: "",
    meeting_link: "",
    location_type: "ONLINE" as "ONLINE" | "INPERSON" | "BOTH"
  });
  const router = useRouter();
  const { startLoading } = useLoading();

  useEffect(() => {
    async function getMeetings() {
      setIsLoading(true);
      try {
        const { data } = await supabase.from("meetings").select().order("start_time", { ascending: false });
        setMeetingData(data);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getMeetings();
  }, []);

  const handleMeetingClick = (meetingId: number) => {
    startLoading();
    setIsNavigating(meetingId.toString());
    router.push(`/events/view/${meetingId}`);
  };

  const handleCreateClick = () => {
    startLoading();
    router.push("/events/create/start");
  };

  const handleEditClick = (meeting: Database["public"]["Tables"]["meetings"]["Row"]) => {
    setSelectedMeeting(meeting);
    setEditFormData({
      name: meeting.name,
      description: meeting.description || "",
      start_time: meeting.start_time,
      end_time: meeting.end_time,
      meeting_link: meeting.meeting_link || "",
      location_type: meeting.location_type || "ONLINE"
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (meeting: Database["public"]["Tables"]["meetings"]["Row"]) => {
    setSelectedMeeting(meeting);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedMeeting) return;

    const { error } = await supabase
      .from("meetings")
      .update(editFormData)
      .eq("meeting_id", selectedMeeting.meeting_id);

    if (error) {
      console.error("Error updating meeting:", error);
      return;
    }

    // Refresh the meetings list
    const { data } = await supabase.from("meetings").select().order("start_time", { ascending: false });
    setMeetingData(data);
    setEditDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMeeting) return;

    // First delete all invitees for this meeting
    const { error: inviteesError } = await supabase
      .from("invitees")
      .delete()
      .eq("meeting_id", selectedMeeting.meeting_id);

    if (inviteesError) {
      console.error("Error deleting invitees:", inviteesError);
      return;
    }

    // Then delete the meeting
    const { error: meetingError } = await supabase
      .from("meetings")
      .delete()
      .eq("meeting_id", selectedMeeting.meeting_id);

    if (meetingError) {
      console.error("Error deleting meeting:", meetingError);
      return;
    }

    // Refresh the meetings list
    const { data } = await supabase.from("meetings").select().order("start_time", { ascending: false });
    setMeetingData(data);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <h1 className="text-center p-4 text-3xl">View meetings created</h1>
      <div className="flex items-center justify-center gap-8 p-8 flex-wrap">
        {meetingData?.map((meeting) => (
          <div key={meeting.meeting_id} className="flex flex-col gap-2">
            <Paper
              variant="outlined"
              sx={{ 
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "300px",
                height: "auto",
                minHeight: "100px",
                position: "relative",
                cursor: "pointer",
                borderColor: "primary.main",
                backgroundColor: "rgba(25, 118, 210, 0.04)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  borderColor: "primary.dark",
                }
              }}
              onClick={() => handleMeetingClick(meeting.meeting_id)}
            >
              <div className="flex flex-col w-full">
                <Typography variant="subtitle1" fontWeight="bold">
                  {meeting.name}
                </Typography>
                <hr className="w-full my-2" />
                <Typography variant="body2" color="text.secondary">
                  {meeting.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {dayjs(meeting.start_time).format("MMM D, YYYY h:mm A")}
                </Typography>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(meeting);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(meeting);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </div>
            </Paper>
          </div>
        ))}

        <Button
          variant="outlined"
          sx={{ 
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "300px",
            height: "100px",
            borderColor: "primary.main",
            backgroundColor: "rgba(25, 118, 210, 0.04)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.08)",
              borderColor: "primary.dark",
            }
          }}
          onClick={handleCreateClick}
        >
          <div className="flex flex-col items-center">
            <Add color="primary" />
            <hr className="w-full my-2 border-primary.light" />
            <Typography color="primary.main">Create New Meeting</Typography>
          </div>
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Meeting</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Meeting Name"
            fullWidth
            value={editFormData.name}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editFormData.description}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Start Time"
            type="datetime-local"
            fullWidth
            value={editFormData.start_time}
            onChange={(e) => setEditFormData({ ...editFormData, start_time: e.target.value })}
          />
          <TextField
            margin="dense"
            label="End Time"
            type="datetime-local"
            fullWidth
            value={editFormData.end_time}
            onChange={(e) => setEditFormData({ ...editFormData, end_time: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Meeting Link"
            fullWidth
            value={editFormData.meeting_link}
            onChange={(e) => setEditFormData({ ...editFormData, meeting_link: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Meeting</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedMeeting?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

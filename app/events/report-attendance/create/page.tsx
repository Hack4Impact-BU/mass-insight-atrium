"use client";

import { useFile } from "@/utils/upload-data/file-context";
import { Button, Typography, TextField, Box, Card, CardContent, CircularProgress, Pagination, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/utils/supabase/types";
import dayjs from "dayjs";
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const MEETINGS_PER_PAGE = 12;

export default function Create() {
  const { setMeetingId } = useFile();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Database["public"]["Tables"]["meetings"]["Row"][]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchMeetings() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("meetings")
        .select()
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Error fetching meetings:", error);
        return;
      }

      setMeetings(data || []);
      setLoading(false);
    }

    fetchMeetings();
  }, []);

  const filteredMeetings = meetings.filter(meeting => 
    meeting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMeetings.length / MEETINGS_PER_PAGE);
  const startIndex = (currentPage - 1) * MEETINGS_PER_PAGE;
  const paginatedMeetings = filteredMeetings.slice(startIndex, startIndex + MEETINGS_PER_PAGE);

  const handleMeetingSelect = (meetingId: number) => {
    setSelectedMeeting(meetingId);
  };

  const handleNext = () => {
    if (selectedMeeting) {
      setMeetingId(selectedMeeting.toString());
      router.push("/events/report-attendance/upload");
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Paper elevation={0} className="p-8 mb-8 bg-white rounded-lg border border-blue-100">
          <Typography variant="h4" className="font-bold mb-2 text-center text-blue-900">
            Select a Meeting
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" className="text-center mb-8 text-blue-700">
            Choose the meeting you want to report attendance for
          </Typography>
          
          <Box sx={{ position: 'relative', maxWidth: 600, mx: 'auto', mb: 6 }}>
            <SearchIcon 
              sx={{ 
                position: 'absolute', 
                left: 12, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'primary.main'
              }} 
            />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search meetings by name or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  pl: 4,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
              }}
            />
          </Box>

          {filteredMeetings.length === 0 ? (
            <Box className="text-center py-12">
              <Typography variant="h6" color="primary" className="text-blue-700">
                No meetings found
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-2 text-blue-600">
                Try adjusting your search or create a new meeting
              </Typography>
            </Box>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedMeetings.map((meeting) => (
                  <Card 
                    key={meeting.meeting_id}
                    onClick={() => handleMeetingSelect(meeting.meeting_id)}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedMeeting === meeting.meeting_id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)',
                        borderColor: 'primary.main',
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom className="font-bold text-blue-900">
                        {meeting.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom className="line-clamp-2 text-blue-700">
                        {meeting.description}
                      </Typography>
                      <Box className="flex items-center gap-2 mt-2">
                        <EventIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary" className="text-blue-700">
                          {dayjs(meeting.start_time).format("MMM D, YYYY h:mm A")}
                        </Typography>
                      </Box>
                      <Box className="flex items-center gap-2 mt-1">
                        <LocationOnIcon fontSize="small" sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary" className="text-blue-700">
                          {meeting.location_type === "ONLINE" ? "Online" : 
                           meeting.location_type === "INPERSON" ? "In Person" : "Hybrid"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <Box className="flex justify-center mt-8">
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'primary.main',
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}

          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.push("/events/report-attendance/create")}
              size="large"
              sx={{
                color: 'primary.main',
                borderColor: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!selectedMeeting}
              size="large"
              sx={{
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                },
              }}
            >
              Next
            </Button>
          </Box>
        </Paper>
      </div>
    </div>
  );
}

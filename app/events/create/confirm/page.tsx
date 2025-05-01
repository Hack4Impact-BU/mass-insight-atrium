"use client";

import { Button, Paper, Typography, Box, Stack, Divider, Chip } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { CheckCircle, CalendarMonth, AccessTime, LocationOn, People, Person } from "@mui/icons-material";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formData = useSelector((state: RootState) => state.eventCreateForm);
  const meetingId = searchParams.get('meetingId');

  const handleViewEvent = () => {
    if (meetingId) {
      router.push(`/events/view/${meetingId}`);
    }
  };

  const handleCreateAnother = () => {
    router.push("/events/create/start");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex w-full bg-gradient-to-br from-[#006EB6] to-[#004B8C]">
      <div className="flex flex-col justify-center px-10 h-screen w-full">
        <h1 className="text-white font-semibold text-7xl mb-5">Atrium</h1>
        <h3 className="text-white font-light text-2xl">
          Seamlessly uniting data and events for streamlined success.
        </h3>
      </div>
      <div className="flex items-center justify-center h-screen w-full">
        <Box sx={{ width: '60%' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              mb: 2, 
              bgcolor: 'background.paper',
              borderRadius: 2
            }}
          >
            <Stack spacing={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
                <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 500, m: 0 }}>
                  Event Created Successfully!
                </Typography>
              </Box>
              
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 400 }}>
                  {formData.meetingName}
                </Typography>
                
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarMonth color="primary" />
                    <Typography>{formatDate(formData.startDate)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccessTime color="primary" />
                    <Typography>{formatTime(formData.startDate)} - {formatTime(formData.endDate)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOn color="primary" />
                    <Typography>
                      {formData.locationType === 'online' ? 'Online Event' : 
                       formData.locationType === 'inperson' ? 'In-Person Event' : 
                       'Hybrid Event'}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip 
                      icon={<People />} 
                      label={`${formData.attendees.length} ${formData.attendees.length === 1 ? 'Attendee' : 'Attendees'}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      icon={<Person />} 
                      label={`${formData.moderators.length} ${formData.moderators.length === 1 ? 'Moderator' : 'Moderators'}`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCreateAnother}
              size="large"
              sx={{ 
                flex: 1,
                py: 1.5,
                color: 'primary.main',
                bgcolor: 'white',
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: 'white',
                  borderColor: 'primary.dark',
                }
              }}
            >
              Create Another Event
            </Button>
            <Button
              variant="contained"
              onClick={handleViewEvent}
              size="large"
              disabled={!meetingId}
              sx={{ 
                flex: 1,
                py: 1.5,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              View Event
            </Button>
          </Box>
        </Box>
      </div>
    </div>
  );
} 
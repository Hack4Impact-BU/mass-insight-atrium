import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/utils/supabase/types';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

type Person = Database['public']['Tables']['people']['Row'];
type School = Database['public']['Tables']['schools']['Row'];
type District = Database['public']['Tables']['districts']['Row'];

interface PeopleSelectorProps {
  onSelectionChange: (selectedPeople: (Person | ManualRecipient)[]) => void;
}

interface PersonWithRelations extends Person {
  school?: School | null;
  district?: District | null;
}

interface ManualRecipient {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_profile: string;
}

interface Meeting {
  meeting_id: number;
  name: string;
  start_time: string;
}

interface Invitee {
  email_address: string;
  first_name: string;
  last_name: string | null;
  status: string;
}

export default function PeopleSelector({ onSelectionChange }: PeopleSelectorProps) {
  const [people, setPeople] = useState<(PersonWithRelations | ManualRecipient)[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualFirstName, setManualFirstName] = useState('');
  const [manualLastName, setManualLastName] = useState('');
  const [manualCount, setManualCount] = useState(0);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);

  const columns: GridColDef<PersonWithRelations | ManualRecipient>[] = [
    { field: 'first_name', headerName: 'First Name', width: 130 },
    { field: 'last_name', headerName: 'Last Name', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'role_profile', headerName: 'Role', width: 130 },
    { field: 'state_work', headerName: 'State', width: 100 },
    { 
      field: 'district',
      headerName: 'District', 
      width: 150,
      renderCell: (params) => {
        const person = params.row as PersonWithRelations;
        return person.district?.name || 'N/A';
      }
    },
    { 
      field: 'school',
      headerName: 'School', 
      width: 150,
      renderCell: (params) => {
        const person = params.row as PersonWithRelations;
        return person.school?.name || 'N/A';
      }
    },
    { field: 'content_area', headerName: 'Content Area', width: 130 },
    { field: 'sy2024_25_course', headerName: 'Course', width: 130 },
    { field: 'sy2024_25_grade_level', headerName: 'Grade Level', width: 130 },
    { field: 'race_ethnicity', headerName: 'Race/Ethnicity', width: 130 },
  ];

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // Fetch people with their related school and district data
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select(`
          *,
          school:schools(*),
          district:districts(*)
        `)
        .order('last_name');

      if (peopleError) {
        console.error('Error fetching people:', peopleError);
        return;
      }

      // Fetch meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('meeting_id, name, start_time')
        .order('start_time', { ascending: false });

      if (meetingsError) {
        console.error('Error fetching meetings:', meetingsError);
      } else {
        setMeetings(meetingsData || []);
      }

      setPeople(peopleData || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectedRows(newSelection);
    // Find the actual people objects to preserve their original ID types
    const selectedPeople = people.filter(person => 
      newSelection.includes(typeof person.id === 'string' ? person.id : person.id.toString())
    );
    console.log('Selected people with original IDs:', selectedPeople);
    onSelectionChange(selectedPeople);
  };

  const handleAddManualRecipient = () => {
    if (!manualEmail) {
      alert('Please enter an email address');
      return;
    }

    const newRecipient: ManualRecipient = {
      id: `manual_${manualCount}`,
      email: manualEmail,
      first_name: manualFirstName || manualEmail.split('@')[0],
      last_name: manualLastName || '',
      role_profile: 'Guest'
    };

    setPeople(prev => [...prev, newRecipient]);
    setManualCount(prev => prev + 1);
    setSelectedRows(prev => [...prev, newRecipient.id]);
    onSelectionChange([...people.filter(p => selectedRows.includes(p.id)), newRecipient]);
    
    // Reset form
    setManualEmail('');
    setManualFirstName('');
    setManualLastName('');
    setOpenDialog(false);
  };

  const handleImportFromMeeting = async () => {
    if (!selectedMeeting) {
      alert('Please select a meeting');
      return;
    }

    const supabase = createClient();
    
    // Fetch invitees for the selected meeting
    const { data: invitees, error: inviteesError } = await supabase
      .from('invitees')
      .select('*')
      .eq('meeting_id', selectedMeeting);

    if (inviteesError) {
      console.error('Error fetching invitees:', inviteesError);
      alert('Error importing meeting attendees');
      return;
    }

    // Convert invitees to recipients format
    const newRecipients = invitees.map((invitee, index) => ({
      id: `meeting_${selectedMeeting}_${index}`,
      email: invitee.email_address,
      first_name: invitee.first_name,
      last_name: invitee.last_name || '',
      role_profile: 'Meeting Attendee'
    }));

    // Add new recipients to the list
    setPeople(prev => [...prev, ...newRecipients]);
    setSelectedRows(prev => [...prev, ...newRecipients.map(r => r.id)]);
    onSelectionChange([
      ...people.filter(p => selectedRows.includes(p.id)), 
      ...newRecipients
    ]);

    setOpenMeetingDialog(false);
    setSelectedMeeting(null);
  };

  return (
    <div>
      <div className="mb-4 flex gap-4">
        <Button 
          variant="contained" 
          onClick={() => setOpenDialog(true)}
          style={{ backgroundColor: '#006EB6' }}
        >
          Add Manual Recipient
        </Button>
        <Button 
          variant="contained" 
          onClick={() => setOpenMeetingDialog(true)}
          style={{ backgroundColor: '#006EB6' }}
        >
          Import from Meeting
        </Button>
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Manual Recipient</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="First Name (optional)"
            type="text"
            fullWidth
            value={manualFirstName}
            onChange={(e) => setManualFirstName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Last Name (optional)"
            type="text"
            fullWidth
            value={manualLastName}
            onChange={(e) => setManualLastName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddManualRecipient} style={{ color: '#006EB6' }}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openMeetingDialog} onClose={() => setOpenMeetingDialog(false)}>
        <DialogTitle>Import from Meeting</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 400, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Meeting</InputLabel>
              <Select
                value={selectedMeeting || ''}
                onChange={(e) => setSelectedMeeting(e.target.value as number)}
                label="Select Meeting"
              >
                {meetings.map((meeting) => (
                  <MenuItem key={meeting.meeting_id} value={meeting.meeting_id}>
                    <Box>
                      <Typography variant="subtitle1">{meeting.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(meeting.start_time).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMeetingDialog(false)}>Cancel</Button>
          <Button onClick={handleImportFromMeeting} style={{ color: '#006EB6' }}>Import</Button>
        </DialogActions>
      </Dialog>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={people}
          columns={columns}
          loading={loading}
          checkboxSelection
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionChange}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </div>
    </div>
  );
} 
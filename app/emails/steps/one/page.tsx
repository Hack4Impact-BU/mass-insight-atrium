"use client"
import React from "react";
import Header from "../../components/progress-header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Buttons from "../../components/nav-buttons";
import DataEntry from "@/components/svg/DataEntry";
import Sheet from "@/components/svg/Sheet";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { createClient } from '@/utils/supabase/client';

interface Meeting {
  meeting_id: number;
  name: string;
  start_time: string;
}

const Page: React.FC = () => {
  const [dataEntryType, setDataEntryType] = useState<string>("");
  const [spreadsheetUpload, setSpreadsheetUpload] = useState<File | null>(null);
  const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchMeetings() {
      const supabase = createClient();
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('meeting_id, name, start_time')
        .order('start_time', { ascending: false });

      if (meetingsError) {
        console.error('Error fetching meetings:', meetingsError);
      } else {
        setMeetings(meetingsData || []);
      }
    }

    fetchMeetings();
  }, []);

  type DivType = "dataEntry" | "spreadsheet" | "meeting";

  const handleClick = (div: DivType) => {
    setDataEntryType(div);
    if (div === "meeting") {
      setOpenMeetingDialog(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSpreadsheetUpload(file);
    setDataEntryType("spreadsheet");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvData = event.target?.result;
        if (typeof csvData !== 'string') return;

        // Parse CSV data
        const rows = csvData.split('\n').map(row => row.split(','));
        const headers = rows[0].map(header => header.trim());
        
        // Map CSV data to recipient format
        const recipients = rows.slice(1).map((row, index) => {
          const recipient: any = { id: `import_${index}` };
          headers.forEach((header, i) => {
            const value = row[i]?.trim() || '';
            const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
            
            if (normalizedHeader.includes('first_name') || normalizedHeader.includes('firstname')) {
              recipient.first_name = value;
            } else if (normalizedHeader.includes('last_name') || normalizedHeader.includes('lastname')) {
              recipient.last_name = value;
            } else if (normalizedHeader.includes('email')) {
              recipient.email = value;
            }
          });

          // Set defaults for missing values
          recipient.first_name = recipient.first_name || recipient.email?.split('@')[0] || '';
          recipient.last_name = recipient.last_name || '';
          recipient.role_profile = 'Imported';
          
          return recipient;
        }).filter(r => r.email); // Only keep records with email addresses

        // Store recipients in localStorage
        localStorage.setItem('selectedRecipients', JSON.stringify(recipients));
        router.push('/emails/steps/three');
      } catch (error) {
        console.error('Error processing CSV:', error);
        alert('Error processing file. Please make sure it is a valid CSV file.');
      }
    };

    reader.readAsText(file);
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
    const recipients = invitees.map((invitee, index) => ({
      id: `meeting_${selectedMeeting}_${index}`,
      email: invitee.email_address,
      first_name: invitee.first_name,
      last_name: invitee.last_name || '',
      role_profile: 'Meeting Attendee'
    }));

    // Store recipients in localStorage
    localStorage.setItem('selectedRecipients', JSON.stringify(recipients));
    router.push('/emails/steps/three');
  };

  const handleNextPageDataSend = () => {
    if (dataEntryType === "dataEntry") {
      router.push('/emails/steps/two');
    } else if (dataEntryType === "spreadsheet" && !spreadsheetUpload) {
      alert("Please select a file to upload");
    }
  };

return (
    <div>
      <Header/>
      <div className="text-center">
        <p className="text-4xl font-semibold">Import a list of recipients</p>
        <p className="text-sm mt-6">Choose how you want to add recipients to your email.</p>
        <div className="flex justify-center mt-8">
          <div className={`w-64 h-56 border m-6 cursor-pointer ${ 
            dataEntryType === "dataEntry" ? "border-[3px] border-[#022C4D]" : "border-[#000]"}`} 
            onClick={() => handleClick("dataEntry")} >
            <div className="flex justify-center mt-10 h-24 items-center">
              <DataEntry/>
            </div>
            <p className="mt-6 text-sm font-medium">Import from Data Entry</p>
          </div>

          <div className={`w-64 h-56 border m-6 cursor-pointer ${ 
            dataEntryType === "spreadsheet" ? "border-[3px] border-[#022C4D]" : "border-[#000]"}`} 
            onClick={() => handleClick("spreadsheet")} >
              <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: "none" }}
              id="logoInput" />
            <div className="flex justify-center mt-10 h-24 items-center" onClick={() => document.getElementById("logoInput")?.click()}>
              <Sheet/>
            </div>
            <p className="mt-6 text-sm font-medium">Import new spreadsheet</p>
            {spreadsheetUpload && (
              <p className="text-sm text-gray-600 mt-2">{spreadsheetUpload.name}</p>
            )}
          </div>

          <div className={`w-64 h-56 border m-6 cursor-pointer ${ 
            dataEntryType === "meeting" ? "border-[3px] border-[#022C4D]" : "border-[#000]"}`} 
            onClick={() => handleClick("meeting")} >
            <div className="flex justify-center mt-10 h-24 items-center">
              <Sheet/>
            </div>
            <p className="mt-6 text-sm font-medium">Import from Meeting</p>
          </div>
        </div>
        
        <div className="mt-12 text-[#645F5F] flex justify-center">
          <div className="w-2/3">
          <p className="text-2xl">NOTICE:</p>
          <p className="text-xs mt-2 text-center">Please format your invitee list appropriately with distinct data fields so that it may be imported more easily. Be sure to at least include the fields "First Name", "Last Name" and/or "Email".</p>
          </div>
        </div>
      </div>

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

      <Buttons
        buttons={[
          { label: "Cancel", diffStyle: true, onClick: () => {} },
          { label: "Previous", onClick: () => {}, disabled: true  },
          { label: "Next Page", onClick: handleNextPageDataSend, disabled: !(dataEntryType.length != 0)  }
        ]}
      />
    </div>
  );
};

export default Page;
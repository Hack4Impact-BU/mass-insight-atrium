"use client";

import React from 'react';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Database } from '@/utils/supabase/types';

type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row'] & {
  email_recipients: (Database['public']['Tables']['email_recipients']['Row'] & {
    person?: Database['public']['Tables']['people']['Row'] | null;
    manual_email?: string | null;
  })[];
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const color =
    status === 'sent' ? 'success' :
    status === 'failed' ? 'error' :
    status === 'pending' ? 'warning' : 'default';
  return <Chip label={status} color={color as any} size="small" aria-label={`Status: ${status}`} />;
};

interface CampaignDetailsProps {
  initialCampaign: EmailCampaign;
}

export default function CampaignDetails({ initialCampaign }: CampaignDetailsProps) {
  return (
    <>
      <Paper className="p-6 mb-6">
        <Typography variant="h6" gutterBottom>Campaign Information</Typography>
        <Box className="grid grid-cols-2 gap-4">
          <div>
            <Typography variant="subtitle2" color="textSecondary">Title</Typography>
            <Typography>{initialCampaign.title}</Typography>
          </div>
          <div>
            <Typography variant="subtitle2" color="textSecondary">Subject</Typography>
            <Typography>{initialCampaign.subject}</Typography>
          </div>
          <div>
            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
            <StatusChip status={initialCampaign.status} />
          </div>
          <div>
            <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
            <Typography>{new Date(initialCampaign.created_at).toLocaleString()}</Typography>
          </div>
        </Box>
      </Paper>
      <Paper className="p-6">
        <Typography variant="h6" gutterBottom>Recipients</Typography>
        <TableContainer>
          <Table aria-label="Recipients Table">
            <TableHead>
              <TableRow>
                <TableCell>Recipient</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Sent At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {initialCampaign.email_recipients.map((recipient) => (
                <TableRow key={recipient.id} tabIndex={0} aria-label={`Recipient ${recipient.id}`}> 
                  <TableCell>
                    {recipient.person ? 
                      `${recipient.person.first_name} ${recipient.person.last_name}` :
                      'Manual Recipient'
                    }
                  </TableCell>
                  <TableCell>
                    {recipient.person?.email || recipient.manual_email}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={recipient.status} />
                  </TableCell>
                  <TableCell>
                    {recipient.sent_at ? new Date(recipient.sent_at).toLocaleString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
} 
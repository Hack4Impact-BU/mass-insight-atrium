"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/utils/supabase/types';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import Header from '../../components/progress-header';

type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row'] & {
  email_recipients: (Database['public']['Tables']['email_recipients']['Row'] & {
    person?: Database['public']['Tables']['people']['Row'] | null;
    manual_email?: string | null;
  })[];
};

type PageParams = {
  id: string;
};

export default function CampaignDetailsPage({ params }: { params: PageParams }) {
  const router = useRouter();
  const { id: campaignId } = React.use(params);
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('email_campaigns')
          .select(`
            *,
            email_recipients (
              id,
              status,
              sent_at,
              person:people(*),
              manual_email
            )
          `)
          .eq('id', campaignId)
          .single();

        if (error) throw error;
        setCampaign(data);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center p-8">
        <Typography color="error">{error || 'Campaign not found'}</Typography>
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" gutterBottom>
            Campaign Details
          </Typography>
          <button
            onClick={() => router.push('/emails/campaigns')}
            className="bg-[#006EB6] text-white px-4 py-2 rounded hover:bg-[#005a9c]"
          >
            Back to Campaigns
          </button>
        </div>

        <Paper className="p-6 mb-6">
          <Typography variant="h6" gutterBottom>Campaign Information</Typography>
          <Box className="grid grid-cols-2 gap-4">
            <div>
              <Typography variant="subtitle2" color="textSecondary">Title</Typography>
              <Typography>{campaign.title}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">Subject</Typography>
              <Typography>{campaign.subject}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Chip 
                label={campaign.status} 
                color={getStatusColor(campaign.status) as any}
                size="small"
              />
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
              <Typography>{new Date(campaign.created_at).toLocaleString()}</Typography>
            </div>
          </Box>
        </Paper>

        <Paper className="p-6">
          <Typography variant="h6" gutterBottom>Recipients</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sent At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaign.email_recipients.map((recipient) => (
                  <TableRow key={recipient.id}>
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
                      <Chip 
                        label={recipient.status} 
                        color={getStatusColor(recipient.status) as any}
                        size="small"
                      />
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
      </div>
    </div>
  );
} 
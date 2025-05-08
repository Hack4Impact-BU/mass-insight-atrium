"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/utils/supabase/types';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Button, Skeleton } from '@mui/material';
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

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const color =
    status === 'sent' ? 'success' :
    status === 'failed' ? 'error' :
    status === 'pending' ? 'warning' : 'default';
  return <Chip label={status} color={color as any} size="small" aria-label={`Status: ${status}`} />;
};

export default function CampaignDetailsPage({ params }: { params: PageParams }) {
  const router = useRouter();
  const campaignId = params.id;
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCampaign = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('email_campaigns')
          .select(`*, email_recipients (id, status, sent_at, person:people(*), manual_email)`)
          .eq('id', campaignId)
          .single();
        if (error) throw error;
        if (isMounted) setCampaign(data);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        if (isMounted) setError('Failed to load campaign details');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCampaign();
    return () => { isMounted = false; };
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Box width="100%" maxWidth={900}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1 }} />
          ))}
        </Box>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center p-8">
        <Typography color="error">{error || 'Campaign not found'}</Typography>
        <Button onClick={() => router.push('/emails/campaigns')} color="primary" sx={{ mt: 2 }}>Back to Campaigns</Button>
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
          <Button
            onClick={() => router.push('/emails/campaigns')}
            variant="contained"
            color="primary"
            aria-label="Back to Campaigns"
          >
            Back to Campaigns
          </Button>
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
              <StatusChip status={campaign.status} />
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
                {campaign.email_recipients.map((recipient) => (
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
      </div>
    </div>
  );
} 
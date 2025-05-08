"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/utils/supabase/types';
import {
  Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Skeleton
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Header from '../components/progress-header';

// Types
type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row'] & {
  email_recipients: Database['public']['Tables']['email_recipients']['Row'][];
};

// Campaign status is determined by its recipients
type CampaignStatus = {
  status: 'draft' | 'sending' | 'sent' | 'failed' | 'partial';
  color: 'default' | 'warning' | 'success' | 'error';
  label: string;
  details: string;
};

const getCampaignStatus = (campaign: EmailCampaign): CampaignStatus => {
  const total = campaign.email_recipients.length;
  const sent = campaign.email_recipients.filter(r => r.status === 'sent').length;
  const failed = campaign.email_recipients.filter(r => r.status === 'failed').length;
  const pending = campaign.email_recipients.filter(r => r.status === 'pending').length;

  // If no recipients, it's a draft
  if (total === 0) {
    return {
      status: 'draft',
      color: 'default',
      label: 'Draft',
      details: 'No recipients added'
    };
  }

  // If all recipients are pending, it's sending
  if (pending === total) {
    return {
      status: 'sending',
      color: 'warning',
      label: 'Sending',
      details: `${pending} pending`
    };
  }

  // If all recipients are sent, it's sent
  if (sent === total) {
    return {
      status: 'sent',
      color: 'success',
      label: 'Sent',
      details: `${sent}/${total} sent`
    };
  }

  // If all recipients failed, it's failed
  if (failed === total) {
    return {
      status: 'failed',
      color: 'error',
      label: 'Failed',
      details: `${failed}/${total} failed`
    };
  }

  // If some sent and some failed, it's partial
  return {
    status: 'partial',
    color: 'warning',
    label: 'Partial',
    details: `${sent}/${total} sent, ${failed} failed, ${pending} pending`
  };
};

const StatusChip: React.FC<{ campaign: EmailCampaign }> = ({ campaign }) => {
  const status = getCampaignStatus(campaign);
  return (
    <Box>
      <Chip 
        label={status.label} 
        color={status.color} 
        size="small" 
        aria-label={`Status: ${status.label}`} 
      />
      <Typography variant="caption" display="block" color="textSecondary">
        {status.details}
      </Typography>
    </Box>
  );
};

const CampaignRow: React.FC<{ campaign: EmailCampaign; onView: () => void }> = ({ campaign, onView }) => {
  return (
    <TableRow tabIndex={0} aria-label={`Campaign ${campaign.title}`}> 
      <TableCell>{campaign.title}</TableCell>
      <TableCell>{campaign.subject}</TableCell>
      <TableCell><StatusChip campaign={campaign} /></TableCell>
      <TableCell>{new Date(campaign.created_at).toLocaleDateString()}</TableCell>
      <TableCell>
        <Button
          onClick={onView}
          color="primary"
          variant="text"
          aria-label={`View details for ${campaign.title}`}
        >
          View Details
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default function CampaignsContent() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCampaigns = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('email_campaigns')
          .select(`*, email_recipients (id, status, sent_at)`)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (isMounted) setCampaigns(data || []);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        if (isMounted) setError('Failed to load email campaigns');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCampaigns();
    return () => { isMounted = false; };
  }, []);

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

  if (error) {
    return (
      <div className="text-center p-8">
        <Typography color="error">{error}</Typography>
        <Button onClick={() => window.location.reload()} color="primary" sx={{ mt: 2 }}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" gutterBottom>
            Email Campaigns
          </Typography>
          <Button
            onClick={() => router.push('/emails/steps/one')}
            variant="contained"
            color="primary"
            aria-label="Create New Campaign"
          >
            Create New Campaign
          </Button>
        </div>
        <TableContainer component={Paper} aria-label="Email Campaigns Table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography>No campaigns found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <CampaignRow
                    key={campaign.id}
                    campaign={campaign}
                    onView={() => router.push(`/emails/campaigns/${campaign.id}`)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
} 
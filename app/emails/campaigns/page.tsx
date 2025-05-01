"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/utils/supabase/types';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import Header from '../components/progress-header';

type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row'] & {
  email_recipients: Database['public']['Tables']['email_recipients']['Row'][];
};

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('email_campaigns')
          .select(`
            *,
            email_recipients (
              id,
              status,
              sent_at
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCampaigns(data || []);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load email campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'draft':
        return 'default';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRecipientStats = (recipients: Database['public']['Tables']['email_recipients']['Row'][]) => {
    const total = recipients.length;
    const sent = recipients.filter(r => r.status === 'sent').length;
    const failed = recipients.filter(r => r.status === 'failed').length;
    const pending = recipients.filter(r => r.status === 'pending').length;

    return `${sent}/${total} sent (${failed} failed, ${pending} pending)`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Typography>Loading campaigns...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <Typography color="error">{error}</Typography>
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
          <button
            onClick={() => router.push('/emails/steps/one')}
            className="bg-[#006EB6] text-white px-4 py-2 rounded hover:bg-[#005a9c]"
          >
            Create New Campaign
          </button>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recipients</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.title}</TableCell>
                  <TableCell>{campaign.subject}</TableCell>
                  <TableCell>
                    <Chip 
                      label={campaign.status} 
                      color={getStatusColor(campaign.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {getRecipientStats(campaign.email_recipients)}
                  </TableCell>
                  <TableCell>
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => router.push(`/emails/campaigns/${campaign.id}`)}
                      className="text-[#006EB6] hover:underline"
                    >
                      View Details
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
} 
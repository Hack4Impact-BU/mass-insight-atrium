import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { Database } from '@/utils/supabase/types';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import Header from '../../components/progress-header';
import CampaignDetails from './campaign-details';

type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row'] & {
  email_recipients: (Database['public']['Tables']['email_recipients']['Row'] & {
    person?: Database['public']['Tables']['people']['Row'] | null;
    manual_email?: string | null;
  })[];
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailsPage({ params }: PageProps) {
  const { id: campaignId } = await params;
  
  // Fetch initial data server-side
  const supabase = await createClient();
  const { data: campaign, error } = await supabase
    .from('email_campaigns')
    .select(`*, email_recipients (id, status, sent_at, person:people(*), manual_email)`)
    .eq('id', campaignId)
    .single();

  if (error || !campaign) {
    return (
      <div className="text-center p-8">
        <Typography color="error">{error?.message || 'Campaign not found'}</Typography>
        <Button href="/emails/campaigns" color="primary" sx={{ mt: 2 }}>Back to Campaigns</Button>
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
            href="/emails/campaigns"
            variant="contained"
            color="primary"
            aria-label="Back to Campaigns"
          >
            Back to Campaigns
          </Button>
        </div>
        <CampaignDetails initialCampaign={campaign} />
      </div>
    </div>
  );
} 
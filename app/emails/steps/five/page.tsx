"use client"
import React, { useEffect, useState } from "react";
import Header from "../../components/progress-header";
import { useRouter } from "next/navigation";
import Buttons from "../../components/nav-buttons";
import { Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/utils/supabase/types';

type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row'];
type Person = Database['public']['Tables']['people']['Row'];

interface EmailSettings {
  customFields: boolean;
  confirmationCode: boolean;
  replyTo: string;
  reminderOne: string;
  reminderTwo: string;
  color: string;
  logoFile: string | null;
}

export default function SendPage() {
    const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [recipients, setRecipients] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load settings from localStorage
        const settingsStr = localStorage.getItem('emailSettings');
        if (settingsStr) {
          setSettings(JSON.parse(settingsStr));
        }

        // Load recipients from localStorage
        const recipientsStr = localStorage.getItem('selectedRecipients');
        if (recipientsStr) {
          setRecipients(JSON.parse(recipientsStr));
        }

        // Load the most recent campaign from Supabase
        const supabase = createClient();
        const { data: campaignData, error } = await supabase
          .from('email_campaigns')
          .select()
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        setCampaign(campaignData);
      } catch (error) {
        console.error('Error loading send data:', error);
        setError('Failed to load email data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSend = async () => {
    if (!campaign || !settings || recipients.length === 0) {
      setError('Missing required data');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Send the email using the API route
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign,
          settings,
          recipients
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const result = await response.json();

      // Update campaign status in Supabase
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({ status: 'sent' })
        .eq('id', campaign.id);

      if (updateError) throw updateError;

      // Clear localStorage
      localStorage.removeItem('emailSettings');
      localStorage.removeItem('selectedRecipients');

      setSuccess(true);
      setTimeout(() => {
        router.push('/emails/campaigns');
      }, 2000);
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (!campaign || !settings || recipients.length === 0) {
    return (
      <div className="text-center p-8">
        <Typography variant="h5" color="error">
          Error loading data. Please go back and try again.
        </Typography>
      </div>
    );
  }

return (
    <div>
      <Header />
      
      <div className="text-center mb-8">
        <Typography variant="h4" gutterBottom>
          Send Email
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Review and send your email
        </Typography>
        </div>

      <div className="max-w-3xl mx-auto px-4">
        <Paper elevation={3} className="p-8">
          <Box className="mb-6">
            <Typography variant="h6" gutterBottom>
              Email Summary
            </Typography>
            <Typography variant="body1">
              <strong>Subject:</strong> {campaign.subject}
            </Typography>
            <Typography variant="body1">
              <strong>Recipients:</strong> {recipients.length}
            </Typography>
            {settings.replyTo && (
              <Typography variant="body1">
                <strong>Reply-to:</strong> {settings.replyTo}
              </Typography>
            )}
            {(settings.reminderOne || settings.reminderTwo) && (
              <Typography variant="body1">
                <strong>Reminders:</strong>
                {settings.reminderOne && ` ${settings.reminderOne} hours before`}
                {settings.reminderOne && settings.reminderTwo && ' and'}
                {settings.reminderTwo && ` ${settings.reminderTwo} hours before`}
              </Typography>
            )}
          </Box>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" className="mb-4">
              Email sent successfully! Redirecting...
            </Alert>
          )}

          <Box className="mt-8">
        <Buttons
            buttons={[
                { 
                  label: "Cancel", 
                  diffStyle: true, 
                  onClick: () => router.push('/emails/steps/four') 
                },
                { 
                  label: "Previous", 
                  onClick: () => router.push('/emails/steps/four') 
                },
                { 
                  label: "Send Email", 
                  onClick: handleSend,
                  disabled: sending || success
                }
            ]}
        />
          </Box>
        </Paper>
      </div>
    </div>
    );
}
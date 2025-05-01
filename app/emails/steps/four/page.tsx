"use client"
import React, { useEffect, useState } from "react";
import Header from "../../components/progress-header";
import { useRouter } from "next/navigation";
import Buttons from "../../components/nav-buttons";
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import Image from 'next/image';
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

export default function PreviewPage() {
    const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [recipients, setRecipients] = useState<Person[]>([]);
  const [previewRecipient, setPreviewRecipient] = useState<Person | null>(null);

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
          const loadedRecipients = JSON.parse(recipientsStr);
          setRecipients(loadedRecipients);
          setPreviewRecipient(loadedRecipients[0]); // Use first recipient for preview
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
        console.error('Error loading preview data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNext = () => {
    router.push('/emails/steps/five');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (!campaign || !settings || !previewRecipient) {
    return (
      <div className="text-center p-8">
        <Typography variant="h5" color="error">
          Error loading preview. Please go back and try again.
        </Typography>
      </div>
    );
  }

  // Replace placeholders in text with actual values
  const replacePlaceholders = (text: string) => {
    return text
      .replace(/{first_name}/g, previewRecipient.first_name)
      .replace(/{last_name}/g, previewRecipient.last_name)
      .replace(/{email}/g, previewRecipient.email || '')
      .replace(/{role}/g, previewRecipient.role_profile || '');
  };

return (
    <div>
      <Header />
      
      <div className="text-center mb-8">
        <Typography variant="h4" gutterBottom>
          Preview Email
        </Typography>
        <Typography variant="body1" color="textSecondary">
          This is how your email will look to recipients
        </Typography>
        </div>

      <div className="max-w-3xl mx-auto px-4">
        <Paper elevation={3} className="p-8" style={{ backgroundColor: settings.color === 'black' ? '#000' : '#fff' }}>
          {settings.logoFile && (
            <div className="mb-6">
              <Image
                src="/mass-insight-logo.png"
                alt="Mass Insight Logo"
                width={200}
                height={53}
                priority
              />
            </div>
          )}

          <div className={settings.color === 'black' ? 'text-white' : 'text-black'}>
            <Typography variant="h5" gutterBottom>
              {replacePlaceholders(campaign.subject)}
            </Typography>

            {settings.replyTo && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Reply-to: {settings.replyTo}
              </Typography>
            )}

            <Box className="my-6 whitespace-pre-wrap">
              {replacePlaceholders(campaign.body)}
            </Box>

            {campaign.footer && (
              <Box className="mt-6 pt-4 border-t">
                {replacePlaceholders(campaign.footer)}
              </Box>
            )}

            {settings.confirmationCode && (
              <Box className="mt-4 p-4 bg-gray-100 rounded">
                <Typography variant="body2">
                  Confirmation Code: <strong>PREVIEW-CODE</strong>
                </Typography>
              </Box>
            )}

            {(settings.reminderOne || settings.reminderTwo) && (
              <Box className="mt-4 text-sm text-gray-600">
                <Typography variant="body2">
                  Automatic reminders will be sent:
                  {settings.reminderOne && ` ${settings.reminderOne} hours before`}
                  {settings.reminderOne && settings.reminderTwo && ' and'}
                  {settings.reminderTwo && ` ${settings.reminderTwo} hours before`}
                  {' the event.'}
                </Typography>
              </Box>
            )}
                        </div>
        </Paper>

        <Box className="mt-8 mb-8">
          <Typography variant="body2" color="textSecondary" gutterBottom>
            This email will be sent to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}.
          </Typography>

        <Buttons
        buttons={[
              { 
                label: "Cancel", 
                diffStyle: true, 
                onClick: () => router.push('/emails/steps/three') 
              },
              { 
                label: "Previous", 
                onClick: () => router.push('/emails/steps/three') 
              },
              { 
                label: "Next", 
                onClick: handleNext
              }
            ]}
          />
        </Box>
      </div>
    </div>
    );
}
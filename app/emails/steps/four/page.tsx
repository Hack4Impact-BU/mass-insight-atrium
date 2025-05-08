"use client"
import React, { useEffect, useState } from "react";
import Header from "../../components/progress-header";
import { useRouter } from "next/navigation";
import Buttons from "../../components/nav-buttons";
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/utils/supabase/types';
import { useEmailContext } from '../../context';

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
    const { state } = useEmailContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // On mount, check for required data in context
    useEffect(() => {
        if (!state.campaign || !state.settings || !state.recipients || state.recipients.length === 0) {
            setError('Missing campaign, settings, or recipients. Please go back and try again.');
        }
    }, [state]);

    const previewRecipient = state.recipients && state.recipients.length > 0 ? state.recipients[0] : null;

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

    if (error || !state.campaign || !state.settings || !previewRecipient) {
        return (
            <div className="text-center p-8">
                <Typography variant="h5" color="error">
                    {error || 'Error loading preview. Please go back and try again.'}
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
                <Paper elevation={3} className="p-8" style={{ backgroundColor: state.settings.color === 'black' ? '#000' : '#fff' }}>
                    {state.settings.logoFile && (
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
                    <div className={state.settings.color === 'black' ? 'text-white' : 'text-black'}>
                        <Typography variant="h5" gutterBottom>
                            {replacePlaceholders(state.campaign.subject || '')}
                        </Typography>
                        {state.settings.replyTo && (
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Reply-to: {state.settings.replyTo}
                            </Typography>
                        )}
                        <Box className="my-6 whitespace-pre-wrap">
                            {replacePlaceholders(state.campaign.body || '')}
                        </Box>
                        {state.campaign.footer && (
                            <Box className="mt-6 pt-4 border-t">
                                {replacePlaceholders(state.campaign.footer)}
                            </Box>
                        )}
                        {state.settings.confirmationCode && (
                            <Box className="mt-4 p-4 bg-gray-100 rounded">
                                <Typography variant="body2">
                                    Confirmation Code: <strong>PREVIEW-CODE</strong>
                                </Typography>
                            </Box>
                        )}
                        {(state.settings.reminderOne || state.settings.reminderTwo) && (
                            <Box className="mt-4 text-sm text-gray-600">
                                <Typography variant="body2">
                                    Automatic reminders will be sent:
                                    {state.settings.reminderOne && ` ${state.settings.reminderOne} hours before`}
                                    {state.settings.reminderOne && state.settings.reminderTwo && ' and'}
                                    {state.settings.reminderTwo && ` ${state.settings.reminderTwo} hours before`}
                                    {' the event.'}
                                </Typography>
                            </Box>
                        )}
                    </div>
                </Paper>
                <Box className="mt-8 mb-8">
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        This email will be sent to {state.recipients.length} recipient{state.recipients.length !== 1 ? 's' : ''}.
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
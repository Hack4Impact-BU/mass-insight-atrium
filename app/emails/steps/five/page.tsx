"use client"
import React, { useEffect, useState } from "react";
import Header from "../../components/progress-header";
import { useRouter } from "next/navigation";
import Buttons from "../../components/nav-buttons";
import { Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
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

export default function SendPage() {
    const router = useRouter();
    const { state, dispatch } = useEmailContext();
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // On mount, check for required data in context
    useEffect(() => {
        if (!state.campaign || !state.settings || !state.recipients || state.recipients.length === 0) {
            setError('Missing campaign, settings, or recipients. Please go back and try again.');
        }
    }, [state]);

    const handleSend = async () => {
        if (!state.campaign || !state.settings || !state.recipients || state.recipients.length === 0) {
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
                    campaign: state.campaign,
                    settings: state.settings,
                    recipients: state.recipients
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to send email');
            }
            // Update campaign status in Supabase
            // (Assume API route handles this, or add here if needed)
            setSuccess(true);
            setTimeout(() => {
                dispatch({ type: 'RESET' });
                router.push('/emails/campaigns');
            }, 2000);
        } catch (error: any) {
            setError(error.message || 'Failed to send email. Please try again.');
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

    if (error || !state.campaign || !state.settings || !state.recipients || state.recipients.length === 0) {
        return (
            <div className="text-center p-8">
                <Typography variant="h5" color="error">
                    {error || 'Error loading data. Please go back and try again.'}
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
                            <strong>Subject:</strong> {state.campaign.subject}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Recipients:</strong> {state.recipients.length}
                        </Typography>
                        {state.settings.replyTo && (
                            <Typography variant="body1">
                                <strong>Reply-to:</strong> {state.settings.replyTo}
                            </Typography>
                        )}
                        {(state.settings.reminderOne || state.settings.reminderTwo) && (
                            <Typography variant="body1">
                                <strong>Reminders:</strong>
                                {state.settings.reminderOne && ` ${state.settings.reminderOne} hours before`}
                                {state.settings.reminderOne && state.settings.reminderTwo && ' and'}
                                {state.settings.reminderTwo && ` ${state.settings.reminderTwo} hours before`}
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
                                    label: sending ? "Sending..." : "Send", 
                                    onClick: handleSend, 
                                    disabled: sending
                                }
            ]}
        />
                    </Box>
                </Paper>
            </div>
    </div>
    );
}
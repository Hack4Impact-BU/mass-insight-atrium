"use client";

import React, { useEffect, useState } from "react";
import Header from "../../components/progress-header";
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Buttons from "../../components/nav-buttons";
import { useRouter } from "next/navigation";
import Modal from "../../components/recip-modal";
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/utils/supabase/types';
import { useEmailContext } from '../../context';

type EmailCampaign = Database['public']['Tables']['email_campaigns']['Insert'];

interface Recipient {
    id: string | number;
    email: string;
    first_name: string;
    last_name: string;
    role_profile: string;
    isManual?: boolean;
}

export default function EmailContent() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [modal, setModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { state, dispatch } = useEmailContext();
    const [formData, setFormData] = React.useState<Partial<EmailCampaign> & {
        customFields: boolean;
        confirmationCode: boolean;
        replyTo: string;
        reminderOne: string;
        reminderTwo: string;
        color: string;
        logoFile: File | null;
        additionalEmail: string;
    }>({
        title: '',
        subject: '',
        body: '',
        footer: '',
        status: 'draft',
        customFields: false,
        confirmationCode: false,
        replyTo: '',
        reminderOne: '',
        reminderTwo: '',
        color: '',
        logoFile: null,
        additionalEmail: ''
    });

    // On mount, load recipients from context
    useEffect(() => {
        if (!state.recipients || state.recipients.length === 0) {
            router.push('/emails/steps/one');
        }
    }, [state.recipients, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleCheckboxChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: !prev[name as keyof typeof prev]
        }));
    };

    const handleSave = async () => {
        if (!formData.title || !formData.subject || !formData.body || state.recipients.length === 0) {
            setError("Please fill out all required fields and select recipients.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            // Create the email campaign
            const { data: campaignData, error: campaignError } = await supabase
                .from('email_campaigns')
                .insert({
                    title: formData.title,
                    subject: formData.subject,
                    body: formData.body,
                    footer: formData.footer ?? '',
                    status: 'draft',
                    created_by: (await supabase.auth.getUser()).data.user?.id
                })
                .select()
                .single();
            if (campaignError) {
                setError('Error creating campaign: ' + campaignError.message);
                throw campaignError;
            }
            if (!campaignData || !campaignData.id) {
                setError('Failed to create campaign: No ID returned');
                throw new Error('Failed to create campaign: No ID returned');
            }
            // Insert recipients
            for (const person of state.recipients) {
                try {
                    const recipientData = {
                        campaign_id: campaignData.id,
                        manual_email: person.email,
                        status: 'pending'
                    };
                    const { error: recipientError } = await supabase
                        .from('email_recipients')
                        .insert(recipientData);
                    if (recipientError) {
                        setError('Error inserting recipient: ' + recipientError.message);
                        throw recipientError;
                    }
                } catch (error: any) {
                    setError('Error processing recipient: ' + (error.message || 'Unknown error'));
                    throw error;
                }
            }
            // Store campaign and settings in context for next steps
            dispatch({ type: 'SET_CAMPAIGN', payload: {
                id: campaignData.id,
                title: formData.title,
                subject: formData.subject,
                body: formData.body,
                footer: formData.footer ?? '',
                status: 'draft'
            }});
            dispatch({ type: 'SET_SETTINGS', payload: {
                customFields: formData.customFields,
                confirmationCode: formData.confirmationCode,
                replyTo: formData.replyTo,
                reminderOne: formData.reminderOne,
                reminderTwo: formData.reminderTwo,
                color: formData.color,
                logoFile: formData.logoFile
            }});
            router.push('/emails/steps/four');
        } catch (error: any) {
            setError(error.message || 'Failed to save email campaign.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddManualRecipient = () => {
        if (!formData.additionalEmail || !formData.additionalEmail.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        const newRecipient: Recipient = {
            id: `manual_${Date.now()}`,
            email: formData.additionalEmail.trim(),
            first_name: formData.additionalEmail.split('@')[0],
            last_name: '',
            role_profile: 'Additional Recipient',
            isManual: true
        };
        dispatch({ type: 'ADD_RECIPIENT', payload: newRecipient });
        setFormData(prev => ({ ...prev, additionalEmail: '' }));
    };

    return (
        <div>
            <Header/>
            <div className="text-center">
                <p className="text-4xl font-semibold">Email your invitees</p>
                <p className="text-sm mt-6">You'll be able to customize the design of your email in the next step.</p>
            </div>

            <div className="flex justify-center mt-10">
                <div className="border border-[#006EB6] p-4 pb-2.5 pt-2.5 flex justify-center items-center">
                    <Checkbox 
                        className="w-8 h-8" 
                        checked={formData.customFields}
                        onChange={() => handleCheckboxChange('customFields')}
                    />
                    <p className="text-sm ml-4">Include replies to custom fields in email confirmation</p>
                </div>

                <div className="border border-[#006EB6] p-4 pb-2.5 pt-2.5 flex justify-center items-center ml-16">
                    <Checkbox 
                        className="w-8 h-8" 
                        checked={formData.confirmationCode}
                        onChange={() => handleCheckboxChange('confirmationCode')}
                    />
                    <p className="text-sm ml-4">Include a confirmation code</p>
                </div>
            </div>

            <div className="mt-10">
                <p className="font-medium">Auto Reminders</p>
                <div className="flex items-center mt-3">
                    <p className="text-sm">Send guests a reminder in advance of start</p>
                    <div className="ml-6">
                        <Select 
                            className="h-10 w-32"
                            name="reminderOne"
                            value={formData.reminderOne || ''}
                            onChange={handleSelectChange}
                        >
                            <MenuItem value="24">24 hours</MenuItem>
                            <MenuItem value="12">12 hours</MenuItem>
                            <MenuItem value="6">6 hours</MenuItem>
                            <MenuItem value="3">3 hours</MenuItem>
                        </Select>
                    </div>
                    <p className="ml-6 text-sm">and</p>
                    <div className="ml-6">
                        <Select 
                            className="h-10 w-32"
                            name="reminderTwo"
                            value={formData.reminderTwo || ''}
                            onChange={handleSelectChange}
                        >
                            <MenuItem value="24">24 hours</MenuItem>
                            <MenuItem value="12">12 hours</MenuItem>
                            <MenuItem value="6">6 hours</MenuItem>
                            <MenuItem value="3">3 hours</MenuItem>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-center items-center mt-10">
                    <div className="w-3/5">
                        <p className="text-sm font-medium">Reply-to Email</p>
                        <input 
                            className="w-3/4 h-10 border border-[#929292] mt-2 pl-3 pr-3"
                            name="replyTo"
                            value={formData.replyTo}
                            onChange={handleInputChange}
                            placeholder="Enter reply-to email"
                        />
                    </div>
                </div>

                <div className="flex justify-center items-center mt-10">
                    <div className="w-3/5">
                        <p className="text-sm font-medium">Email Title</p>
                        <input 
                            className="w-3/4 h-10 border border-[#929292] mt-2 pl-3 pr-3"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter email title"
                        />
                    </div>
                </div>

                <div className="flex justify-center items-center mt-10">
                    <div className="w-3/5">
                        <p className="text-sm font-medium">Email Subject</p>
                        <input 
                            className="w-3/4 h-10 border border-[#929292] mt-2 pl-3 pr-3"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Enter email subject"
                        />
                    </div>
                </div>

                <div className="flex justify-center items-center mt-10">
                    <div className="w-3/5">
                        <p className="text-sm font-medium">Email Body</p>
                        <textarea 
                            className="w-3/4 h-40 border border-[#929292] mt-2 pl-3 pr-3 pt-2"
                            name="body"
                            value={formData.body}
                            onChange={handleInputChange}
                            placeholder="Enter email body"
                        />
                    </div>
                </div>

                <div className="flex justify-center items-center mt-10">
                    <div className="w-3/5">
                        <p className="text-sm font-medium">Email Footer</p>
                        <textarea 
                            className="w-3/4 h-20 border border-[#929292] mt-2 pl-3 pr-3 pt-2"
                            name="footer"
                            value={formData.footer || ''}
                            onChange={handleInputChange}
                            placeholder="Enter email footer"
                        />
                    </div>
                </div>

                <div className="flex justify-center items-center mt-10">
                    <div className="w-3/5">
                        <p className="text-sm font-medium">Additional Recipients</p>
                        <div className="flex items-center mt-2">
                            <input 
                                className="w-3/4 h-10 border border-[#929292] pl-3 pr-3"
                                name="additionalEmail"
                                value={formData.additionalEmail}
                                onChange={handleInputChange}
                                placeholder="Enter additional email"
                            />
                            <button 
                                className="ml-4 px-4 py-2 bg-[#006EB6] text-white rounded"
                                onClick={handleAddManualRecipient}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 text-red-500 text-center">
                        {error}
                    </div>
                )}
            </div>

            <Buttons
                buttons={[
                    { label: "Cancel", diffStyle: true, onClick: () => {} },
                    { label: "Previous", onClick: () => router.push('/emails/steps/two') },
                    { label: "Next Page", onClick: handleSave, disabled: loading }
                ]}
            />
        </div>
    );
} 
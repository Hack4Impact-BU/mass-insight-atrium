'use client';

import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button } from '@mui/material';
import { PeopleAlt as PeopleIcon, CheckCircle as CheckCircleIcon, Percent as PercentIcon, Download as DownloadIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/utils/supabase/types';

interface EventOverviewProps {
    meetingId: string;
}

interface EventStats {
    totalInvitees: number;
    totalParticipated: number;
    participationRate: number;
    meetingDetails: Database['public']['Tables']['meetings']['Row'] | null;
    inviteesData: Database['public']['Tables']['invitees']['Row'][] | null;
}

export const EventOverview: React.FC<EventOverviewProps> = ({ meetingId }) => {
    const [stats, setStats] = useState<EventStats>({
        totalInvitees: 0,
        totalParticipated: 0,
        participationRate: 0,
        meetingDetails: null,
        inviteesData: null
    });

    useEffect(() => {
        const fetchEventStats = async () => {
            const supabase = createClient();
            
            // Fetch meeting details
            const { data: meetingData } = await supabase
                .from('meetings')
                .select()
                .eq('meeting_id', parseInt(meetingId))
                .single();

            // Fetch invitees data
            const { data: inviteesData } = await supabase
                .from('invitees')
                .select()
                .eq('meeting_id', parseInt(meetingId));

            if (inviteesData) {
                const totalInvitees = inviteesData.length;
                const totalParticipated = inviteesData.filter(i => i.status === 'PARTICIPATED').length;
                const participationRate = totalInvitees > 0 ? (totalParticipated / totalInvitees) * 100 : 0;

                setStats({
                    totalInvitees,
                    totalParticipated,
                    participationRate,
                    meetingDetails: meetingData,
                    inviteesData
                });
            }
        };

        fetchEventStats();
    }, [meetingId]);

    const handleDownload = () => {
        if (!stats.inviteesData) return;

        // Prepare CSV content
        const headers = ['First Name', 'Last Name', 'Email', 'Status', 'Is Moderator'];
        const rows = stats.inviteesData.map(invitee => [
            invitee.first_name,
            invitee.last_name || '',
            invitee.email_address,
            invitee.status,
            invitee.is_moderator ? 'Yes' : 'No'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${stats.meetingDetails?.name || 'event'}_invitees.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const StatCard = ({ icon: Icon, title, value, color }: { icon: any, title: string, value: string | number, color: string }) => (
        <Box sx={{
            bgcolor: 'white',
            p: 3,
            borderRadius: 2,
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 24px 0 rgba(0,0,0,0.1)',
            }
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{
                    bgcolor: color,
                    borderRadius: '12px',
                    p: 1,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                    {title}
                </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: color }}>
                {typeof value === 'number' && !title.includes('Rate') ? value.toLocaleString() : value}
                {title.includes('Rate') && '%'}
            </Typography>
        </Box>
    );

    return (
        <Box sx={{ mb: 4, mt: 4 }}>
            {stats.meetingDetails && (
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {stats.meetingDetails.name}
                        </Typography>
                        {stats.meetingDetails.description && (
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                {stats.meetingDetails.description}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <CalendarIcon fontSize="small" />
                            <Typography variant="body2">
                                {new Date(stats.meetingDetails.start_time).toLocaleString()} - {new Date(stats.meetingDetails.end_time).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        sx={{
                            bgcolor: '#2196f3',
                            '&:hover': {
                                bgcolor: '#1976d2',
                            }
                        }}
                    >
                        Download CSV
                    </Button>
                </Box>
            )}
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <StatCard
                        icon={PeopleIcon}
                        title="Total Invitees"
                        value={stats.totalInvitees}
                        color="#2196f3"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        icon={CheckCircleIcon}
                        title="Total Participated"
                        value={stats.totalParticipated}
                        color="#4caf50"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        icon={PercentIcon}
                        title="Participation Rate"
                        value={stats.participationRate.toFixed(1)}
                        color="#ff9800"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}; 
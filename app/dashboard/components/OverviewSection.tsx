'use client';

import React, { useState, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, IconButton, Tooltip } from '@mui/material';
import { Download as DownloadIcon, People as PeopleIcon, EventAvailable as EventAvailableIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { Gauge } from '@mui/x-charts/Gauge';
import { createClient } from "@/utils/supabase/client";
import { OverviewType, DetailedAttendanceData } from '../types';
import { downloadAsCSV } from '../utils';
import { TimeFilter } from './TimeFilter';
import { DashboardService } from '../services/dashboardService';

interface OverviewSectionProps {
    overview: OverviewType | null;
    onTimeRangeChange: (range: { start: Date; end: Date }) => void;
    selectedTimeFilter: string;
    onSelectedChange: (selected: string) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ overview, onTimeRangeChange, selectedTimeFilter, onSelectedChange }) => {
    if (!overview) return null;

    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const supabase = createClient();
    const dashboardService = new DashboardService();

    const downloadDetailedData = async () => {
        setIsExporting(true);
        setExportError(null);
        try {
            if (!overview?.timeRange) {
                throw new Error('No time range selected');
            }

            const detailedData = await dashboardService.fetchDetailedAttendanceData(overview.timeRange);
            
            if (detailedData.length === 0) {
                setExportError('No attendance data found in the selected time range');
                return;
            }

            downloadAsCSV(detailedData, `attendance-data-${overview.timeRange.start.toISOString().split('T')[0]}-to-${overview.timeRange.end.toISOString().split('T')[0]}`);
        } catch (error) {
            console.error('Error downloading detailed data:', error);
            setExportError(error instanceof Error ? error.message : 'Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    // Prepare chart data
    const attendanceData = useMemo(() => {
        if (!overview?.attendanceOverTime) return [];
        return overview.attendanceOverTime.map(item => ({
            label: item.meetingName,
            value: item.count
        }));
    }, [overview]);

    const participationData = useMemo(() => {
        if (!overview?.participationBySchool) return [];
        return Object.entries(overview.participationBySchool).map(([school, value]) => ({
            label: school,
            value: value as number
        }));
    }, [overview]);

    const gaugeValue = overview && overview.totalRegistrations > 0 
        ? (overview.attendeeAttendance / overview.totalRegistrations) * 100 
        : 0;

    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>Overview</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {exportError && (
                        <Typography color="error" variant="caption">
                            {exportError}
                        </Typography>
                    )}
                    <Tooltip title="Download detailed data">
                        <IconButton 
                            onClick={downloadDetailedData}
                            disabled={isExporting}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>
                    <TimeFilter onTimeRangeChange={onTimeRangeChange} selected={selectedTimeFilter} onSelectedChange={onSelectedChange} />
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
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
                                bgcolor: 'primary.main',
                                borderRadius: '12px',
                                p: 1,
                                mr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <PeopleIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                                Total Registrations
                            </Typography>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {overview.totalRegistrations.toLocaleString()}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
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
                                bgcolor: '#00bcd4',
                                borderRadius: '12px',
                                p: 1,
                                mr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <EventAvailableIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                                Attendee Attendance
                            </Typography>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#00bcd4' }}>
                            {overview.attendeeAttendance.toLocaleString()}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
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
                                bgcolor: '#4caf50',
                                borderRadius: '12px',
                                p: 1,
                                mr: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                                Attendee Retention
                            </Typography>
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                            {overview.attendeeRetention}%
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
                        <BarChart 
                            data={attendanceData}
                            title="Attendance Over Time"
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
                        <PieChart 
                            data={participationData}
                            title="Participation by School"
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}; 
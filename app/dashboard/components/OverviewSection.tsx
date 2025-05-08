'use client';

import React, { useState, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, IconButton, Tooltip } from '@mui/material';
import { Download as DownloadIcon, People as PeopleIcon, EventAvailable as EventAvailableIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { BarChart } from './BarChart';
import { PieChart, ViewType } from './PieChart';
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
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [pieChartView, setPieChartView] = useState<ViewType>('school');
    const supabase = createClient();
    const dashboardService = new DashboardService();

    const downloadDetailedData = async () => {
        if (!overview?.timeRange) {
            setExportError('No time range selected');
            return;
        }

        setIsExporting(true);
        setExportError(null);
        try {
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
            label: new Date(item.date).toLocaleDateString(),
            value: item.count,
            description: item.meetingName,
            meetingId: item.meetingId
        }));
    }, [overview]);

    const participationData = useMemo(() => {
        if (!overview?.participationBySchool) return [];

        const data: Record<string, number> = {};

        // Helper function to increment count
        const incrementCount = (key: string) => {
            data[key] = (data[key] || 0) + 1;
        };

        // Process data based on view type
        switch (pieChartView) {
            case 'school':
                Object.entries(overview.participationBySchool).forEach(([key, value]) => {
                    data[key] = value;
                });
                break;
            case 'district':
                Object.entries(overview.participationByDistrict).forEach(([key, value]) => {
                    data[key] = value;
                });
                break;
            case 'state':
                Object.entries(overview.participationByState).forEach(([key, value]) => {
                    data[key] = value;
                });
                break;
            case 'role':
                Object.entries(overview.participationByRole).forEach(([key, value]) => {
                    data[key] = value;
                });
                break;
            case 'content':
                Object.entries(overview.participationByContentArea).forEach(([key, value]) => {
                    data[key] = value;
                });
                break;
            case 'grade':
                Object.entries(overview.participationByGrade).forEach(([key, value]) => {
                    data[`Grade ${key}`] = value;
                });
                break;
            case 'course':
                Object.entries(overview.participationByCourse).forEach(([key, value]) => {
                    data[key] = value;
                });
                break;
            case 'race':
                Object.entries(overview.participationByRace).forEach(([key, value]) => {
                    data[key] = value;
                });
                break;
        }

        return Object.entries(data)
            .map(([label, value]) => ({
                label,
                value
            }))
            .sort((a, b) => b.value - a.value); // Sort by value in descending order
    }, [overview, pieChartView]);

    const gaugeValue = overview && overview.totalRegistrations > 0 
        ? (overview.attendeeAttendance / overview.totalRegistrations) * 100 
        : 0;

    if (!overview) return null;

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
                                Attendance
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
                            title="Participation Distribution"
                            viewType={pieChartView}
                            onViewTypeChange={setPieChartView}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}; 
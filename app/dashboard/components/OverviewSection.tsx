'use client';

import { useState, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, IconButton, Tooltip } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
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
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ overview, onTimeRangeChange }) => {
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
                    <TimeFilter onTimeRangeChange={onTimeRangeChange} />
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
                        <Typography variant="subtitle1" color="text.secondary">Total Registrations</Typography>
                        <Typography variant="h3" sx={{ mt: 1 }}>{overview.totalRegistrations}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
                        <Typography variant="subtitle1" color="text.secondary">Attendee Attendance</Typography>
                        <Typography variant="h3" sx={{ mt: 1 }}>{overview.attendeeAttendance}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
                        <Typography variant="subtitle1" color="text.secondary">Attendee Retention</Typography>
                        <Typography variant="h3" sx={{ mt: 1 }}>{overview.attendeeRetention}%</Typography>
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
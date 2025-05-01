"use client"
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { OverviewType, EventType, StudentType } from './types';
import { OverviewSection } from './components/OverviewSection';
import { UpcomingEventsSection } from './components/UpcomingEventsSection';
import { StudentTableSection } from './components/StudentTableSection';
import { DashboardService } from './services/dashboardService';
import { DashboardLogo } from './components/DashboardLogo';

const dashboardService = new DashboardService();

const Page: React.FC = () => {
    const [overview, setOverview] = useState<OverviewType | null>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<EventType[]>([]);
    const [studentData, setStudentData] = useState<StudentType[]>([]);
    const [timeRange, setTimeRange] = useState<{ start: Date; end: Date }>({
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: new Date()
    });
    const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('month');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleTimeRangeChange = (range: { start: Date; end: Date }) => {
        setTimeRange(range);
    };

    const handleSelectedChange = (selected: string) => {
        setSelectedTimeFilter(selected);
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await dashboardService.fetchDashboardData(timeRange);
                setOverview(data.overview);
                setUpcomingEvents(data.upcomingEvents);
                setStudentData(data.studentData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [timeRange]);

    if (error) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error" variant="h6">{error}</Typography>
                <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => window.location.reload()}
                >
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, md: 4 }, maxWidth: 1500, mx: 'auto', bgcolor: '#f7fafd', minHeight: '100vh' }}>
            <DashboardLogo />
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <OverviewSection 
                        overview={overview} 
                        onTimeRangeChange={handleTimeRangeChange}
                        selectedTimeFilter={selectedTimeFilter}
                        onSelectedChange={handleSelectedChange}
                    />
                    <UpcomingEventsSection events={upcomingEvents} />
                    <StudentTableSection students={studentData} />
                </>
            )}
        </Box>
  );
};

export default Page;
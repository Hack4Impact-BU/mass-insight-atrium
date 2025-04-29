'use client';

import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

export interface TimeFilterProps {
    onTimeRangeChange: (range: { start: Date; end: Date }) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({ onTimeRangeChange }) => {
    const [timeRange, setTimeRange] = React.useState('month');

    const handleTimeRangeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newTimeRange: string | null,
    ) => {
        if (!newTimeRange) return;
        setTimeRange(newTimeRange);

        const end = new Date();
        let start = new Date();

        switch (newTimeRange) {
            case 'week':
                start.setDate(end.getDate() - 7);
                break;
            case 'month':
                start.setMonth(end.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(end.getFullYear() - 1);
                break;
            case 'lifetime':
                // Set to a date far in the past to get all records
                start = new Date(2000, 0, 1);
                break;
        }

        onTimeRangeChange({ start, end });
    };

    return (
        <Box>
            <ToggleButtonGroup
                value={timeRange}
                exclusive
                onChange={handleTimeRangeChange}
                aria-label="time range"
                size="small"
            >
                <ToggleButton value="week" aria-label="week">
                    Week
                </ToggleButton>
                <ToggleButton value="month" aria-label="month">
                    Month
                </ToggleButton>
                <ToggleButton value="year" aria-label="year">
                    Year
                </ToggleButton>
                <ToggleButton value="lifetime" aria-label="lifetime">
                    Lifetime
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}; 
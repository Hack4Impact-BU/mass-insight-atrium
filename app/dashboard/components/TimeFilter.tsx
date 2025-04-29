'use client';

import React, { useState } from 'react';
import { 
    Box, 
    ToggleButton, 
    ToggleButtonGroup, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

export interface TimeFilterProps {
    onTimeRangeChange: (range: { start: Date; end: Date }) => void;
    selected: string;
    onSelectedChange: (selected: string) => void;
}

export const TimeFilter: React.FC<TimeFilterProps> = ({ onTimeRangeChange, selected, onSelectedChange }) => {
    const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
    const [customStartDate, setCustomStartDate] = useState<Dayjs | null>(dayjs());
    const [customEndDate, setCustomEndDate] = useState<Dayjs | null>(dayjs());

    const handleTimeRangeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newTimeRange: string | null,
    ) => {
        if (!newTimeRange) return;
        
        if (newTimeRange === 'custom') {
            setIsCustomDialogOpen(true);
            return;
        }

        onSelectedChange(newTimeRange);
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

    const handleCustomDateSubmit = () => {
        if (customStartDate && customEndDate) {
            onSelectedChange('custom');
            const endDate = customEndDate.toDate();
            endDate.setHours(23, 59, 59, 999);
            
            onTimeRangeChange({ 
                start: customStartDate.toDate(), 
                end: endDate
            });
            setIsCustomDialogOpen(false);
        }
    };

    return (
        <Box>
            <ToggleButtonGroup
                value={selected}
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
                <ToggleButton value="custom" aria-label="custom">
                    Custom
                </ToggleButton>
            </ToggleButtonGroup>

            <Dialog 
                open={isCustomDialogOpen} 
                onClose={() => setIsCustomDialogOpen(false)}
                PaperProps={{
                    sx: { width: '100%', maxWidth: 400 }
                }}
            >
                <DialogTitle>Select Custom Date Range</DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <DatePicker
                                label="Start Date"
                                value={customStartDate}
                                onChange={(newValue) => setCustomStartDate(newValue)}
                                maxDate={customEndDate || dayjs()}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        variant: 'outlined'
                                    }
                                }}
                            />
                            <DatePicker
                                label="End Date"
                                value={customEndDate}
                                onChange={(newValue) => setCustomEndDate(newValue)}
                                minDate={customStartDate || undefined}
                                maxDate={dayjs()}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        variant: 'outlined'
                                    }
                                }}
                            />
                        </Box>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setIsCustomDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleCustomDateSubmit}
                        disabled={!customStartDate || !customEndDate}
                        variant="contained"
                    >
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}; 
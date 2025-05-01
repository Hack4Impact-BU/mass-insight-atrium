'use client';

import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart';

export type ViewType = 'school' | 'district' | 'state' | 'role' | 'content' | 'grade' | 'course' | 'race';

export interface PieChartData {
    label: string;
    value: number;
}

interface PieChartProps {
    data: PieChartData[];
    title?: string;
    viewType: ViewType;
    onViewTypeChange: (viewType: ViewType) => void;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title, viewType, onViewTypeChange }) => {
    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No data available</Typography>
            </Box>
        );
    }

    const handleViewChange = (event: SelectChangeEvent) => {
        onViewTypeChange(event.target.value as ViewType);
    };

    const viewOptions = [
        { value: 'school', label: 'School' },
        { value: 'district', label: 'District' },
        { value: 'state', label: 'State' },
        { value: 'role', label: 'Role Profile' },
        { value: 'content', label: 'Content Area' },
        { value: 'grade', label: '24-25 Grade Level' },
        { value: 'course', label: '24-25 Course' },
        { value: 'race', label: 'Race/Ethnicity' }
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {title && (
                    <Typography variant="h6">
                        {title}
                    </Typography>
                )}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={viewType}
                        onChange={handleViewChange}
                        sx={{ height: 32 }}
                    >
                        {viewOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{ width: '100%', height: 300 }}>
                <MuiPieChart
                    series={[
                        {
                            data: data.map(item => ({
                                id: item.label,
                                value: item.value,
                                label: `${item.label}: ${item.value} (${((item.value / total) * 100).toFixed(1)}%)`
                            })),
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30 },
                            valueFormatter: () => '' // Remove static labels
                        }
                    ]}
                    height={300}
                    slotProps={{
                        legend: {
                            hidden: true
                        }
                    }}
                />
            </Box>
        </Box>
    );
}; 
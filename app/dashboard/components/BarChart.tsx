import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart as MuiBarChart } from '@mui/x-charts/BarChart';

export interface BarChartData {
    label: string;
    value: number;
}

export interface BarChartProps {
    data: BarChartData[];
    title?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No data available</Typography>
            </Box>
        );
    }

    const maxValue = Math.max(...data.map(item => item.value));
    const yAxisMax = Math.ceil(maxValue * 1.2); // Add 20% padding to the top

    return (
        <Box>
            {title && (
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
            )}
            <Box sx={{ width: '100%', height: 300 }}>
                <MuiBarChart
                    series={[
                        {
                            data: data.map(item => item.value),
                            label: 'Attendees',
                            color: '#00bcd4',
                            valueFormatter: (value) => {
                                const matchingItem = data.find(item => item.value === value);
                                return matchingItem ? `${matchingItem.label}: ${value} attendees` : `${value} attendees`;
                            }
                        }
                    ]}
                    xAxis={[{
                        data: data.map((_, index) => `Event ${index + 1}`),
                        scaleType: 'band',
                        tickLabelStyle: {
                            fontSize: 12
                        }
                    }]}
                    yAxis={[{
                        min: 0,
                        max: yAxisMax,
                        tickNumber: 5
                    }]}
                    height={300}
                    margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
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
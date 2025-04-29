import React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart as MuiPieChart } from '@mui/x-charts/PieChart';

export interface PieChartData {
    label: string;
    value: number;
}

export interface PieChartProps {
    data: PieChartData[];
    title?: string;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No data available</Typography>
            </Box>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const chartData = data.map((item, index) => ({
        id: index,
        value: item.value,
        label: item.label
    }));

    return (
        <Box>
            {title && (
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
            )}
            <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
                <MuiPieChart
                    series={[
                        {
                            data: chartData,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            arcLabel: (item) => `${item.value}`,
                            arcLabelMinAngle: 45,
                            color: '#00bcd4',
                            valueFormatter: (item) => {
                                const percentage = ((item.value / total) * 100).toFixed(1);
                                return `${item.label}: ${item.value} (${percentage}%)`;
                            }
                        },
                    ]}
                    height={300}
                    width={300}
                    margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    slotProps={{
                        legend: {
                            direction: 'row',
                            position: { vertical: 'bottom', horizontal: 'middle' },
                            padding: 0,
                            itemMarkWidth: 10,
                            itemMarkHeight: 10,
                            markGap: 5,
                            itemGap: 15,
                        }
                    }}
                />
            </Box>
        </Box>
    );
}; 
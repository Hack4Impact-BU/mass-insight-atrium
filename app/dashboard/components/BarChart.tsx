import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart as MuiBarChart } from '@mui/x-charts/BarChart';

export interface BarChartData {
    label: string;
    value: number;
    description?: string;
}

export interface BarChartProps {
    data: BarChartData[];
    title?: string;
    valueLabel?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title, valueLabel = 'Count' }) => {
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
                            label: valueLabel,
                            color: '#00bcd4',
                            valueFormatter: (value) => {
                                const item = data.find(d => d.value === value);
                                if (!item) return `${value}`;
                                return item.description 
                                    ? `${item.label}: ${value} (${item.description})`
                                    : `${item.label}: ${value}`;
                            }
                        }
                    ]}
                    xAxis={[{
                        data: data.map(item => item.label),
                        scaleType: 'band',
                        tickLabelStyle: {
                            fontSize: 12,
                            angle: data.length > 5 ? 315 : 0,
                            textAnchor: data.length > 5 ? 'end' : 'middle',
                        }
                    }]}
                    yAxis={[{
                        min: 0,
                        max: yAxisMax,
                        tickNumber: 5
                    }]}
                    height={300}
                    margin={{ 
                        left: 60, 
                        right: 20, 
                        top: 20, 
                        bottom: data.length > 5 ? 80 : 40 
                    }}
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
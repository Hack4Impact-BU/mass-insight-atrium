import React, { useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { BarChart as MuiBarChart } from '@mui/x-charts/BarChart';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';

export interface BarChartData {
    label: string;
    value: number;
    description?: string;
    meetingId?: number;
}

export interface BarChartProps {
    data: BarChartData[];
    title?: string;
    valueLabel?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title, valueLabel = 'Count' }) => {
    const router = useRouter();
    const chartRef = useRef<HTMLDivElement>(null);

    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No data available</Typography>
            </Box>
        );
    }

    const maxValue = Math.max(...data.map(item => item.value));
    const yAxisMax = Math.ceil(maxValue * 1.2); // Add 20% padding to the top

    const handleDownload = async () => {
        if (chartRef.current) {
            const canvas = await html2canvas(chartRef.current);
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = 'chart.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {title && (
                    <Typography variant="h6">
                        {title}
                    </Typography>
                )}
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    size="small"
                    sx={{
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                        color: 'text.primary',
                        '&:hover': {
                            borderColor: 'rgba(0, 0, 0, 0.23)',
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }
                    }}
                >
                    Download
                </Button>
            </Box>
            <Box ref={chartRef} sx={{ width: '100%', height: 300, bgcolor: 'white' }}>
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
                    sx={{
                        '.MuiBarElement-root': {
                            cursor: 'pointer',
                            '&:hover': {
                                filter: 'brightness(0.9)'
                            }
                        }
                    }}
                    onItemClick={(event: React.MouseEvent, params: { dataIndex: number }) => {
                        if (params.dataIndex !== undefined) {
                            const item = data[params.dataIndex];
                            if (item.meetingId) {
                                router.push(`/events/view/${item.meetingId}`);
                            }
                        }
                    }}
                />
            </Box>
        </Box>
    );
}; 
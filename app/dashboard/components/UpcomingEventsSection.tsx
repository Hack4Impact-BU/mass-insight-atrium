'use client';

import * as React from 'react';
import { Card, CardContent, Typography, List, ListItemText, Divider, ListItemButton } from '@mui/material';
import { EventType } from '../types';
import { useRouter } from 'next/navigation';

interface UpcomingEventsSectionProps {
    events: EventType[];
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
    const router = useRouter();

    return (
        <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent>
                <Typography variant="h5" fontWeight={700} mb={2}>Upcoming Events</Typography>
                {events.length > 0 ? (
                    <List>
                        {events.map((event, idx) => (
                            <React.Fragment key={event.meeting_id}>
                                <ListItemButton 
                                    onClick={() => router.push(`/events/view/${event.meeting_id}`)}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                        }
                                    }}
                                >
                                    <ListItemText
                                        primary={<Typography fontWeight={600}>{event.name}</Typography>}
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(event.start_time).toLocaleString()} — {new Date(event.end_time).toLocaleString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItemButton>
                                {idx < events.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography color="text.secondary">No upcoming events.</Typography>
                )}
            </CardContent>
        </Card>
    );
} 
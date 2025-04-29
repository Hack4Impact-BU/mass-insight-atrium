'use client';

import * as React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { EventType } from '../types';

interface UpcomingEventsSectionProps {
    events: EventType[];
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
    return (
        <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent>
                <Typography variant="h5" fontWeight={700} mb={2}>Upcoming Events</Typography>
                {events.length > 0 ? (
                    <List>
                        {events.map((event, idx) => (
                            <React.Fragment key={event.meeting_id}>
                                <ListItem alignItems="flex-start">
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
                                </ListItem>
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
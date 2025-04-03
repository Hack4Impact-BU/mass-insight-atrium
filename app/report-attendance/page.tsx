'use client';

// import React, { useState } from 'react';
// import { parseZoomAttendanceReport } from '../../utils/event-attendance';
// import { Attendee } from '../../utils/event-attendance/index';
// import fs from 'fs';

const ReportAttendancePage: React.FC = () => {
    // const [attendees, setAttendees] = useState<Attendee[]>([]);
    // const [error, setError] = useState<string | null>(null);

    // const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = event.target.files?.[0];
    //     if (file) {
    //         const buffer = await file.arrayBuffer();
    //         const attendees = await parseZoomAttendanceReport(buffer);
    //     }
    // };

    return (
        <div>
            <h1>Upload Zoom Attendance Report</h1>
            {/* <input type="file" accept=".csv" onChange={handleFileUpload} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <h2>Attendees</h2>
            <ul>
                {attendees.map((attendee, index) => (
                    <li key={index}>
                        {attendee.name} ({attendee.email}) - Joined: {attendee.joinTime}, Left: {attendee.leaveTime}, Duration: {attendee.duration} minutes
                    </li>
                ))}
            </ul> */}
        </div>
    );
};

export default ReportAttendancePage;

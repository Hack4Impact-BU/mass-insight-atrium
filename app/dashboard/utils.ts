import { TimeFilterOption, DetailedAttendanceData } from './types';

export const downloadAsCSV = (data: DetailedAttendanceData[], filename: string) => {
    const start = new Date();
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`CSV download took ${new Date().getTime() - start.getTime()}ms`);
};

export const getTimeRangeFromOption = (option: TimeFilterOption, customRange?: { start: Date; end: Date }) => {
    const end = new Date();
    const start = new Date();

    switch (option) {
        case '7days':
            start.setDate(end.getDate() - 7);
            break;
        case '30days':
            start.setDate(end.getDate() - 30);
            break;
        case '90days':
            start.setDate(end.getDate() - 90);
            break;
        case 'custom':
            if (customRange) {
                return customRange;
            }
            start.setDate(end.getDate() - 30); // Default to 30 days if no custom range
            break;
    }

    return { start, end };
};

export const convertToCSV = (data: DetailedAttendanceData[]): string => {
    const columns = [
        'Meeting Name',
        'Meeting Date',
        'Meeting Start Time',
        'Meeting End Time',
        'Attendee Name',
        'Attendee Email',
        'First Name',
        'Last Name',
        'Date of Birth',
        'Role Profile',
        'Race/Ethnicity',
        'State Work',
        'School Name',
        'District Name',
        'Content Area',
        '24-25 Course',
        '24-25 Grade Level',
        'Status'
    ];

    const rows = data.map(row => {
        const values = [
            row.meeting_name,
            row.meeting_date,
            row.meeting_start_time,
            row.meeting_end_time,
            row.attendee_name,
            row.attendee_email,
            row.first_name,
            row.last_name,
            row.date_of_birth,
            row.role_profile,
            row.race_ethnicity,
            row.state_work,
            row.school_name,
            row.district_name,
            row.content_area,
            row.sy2024_25_course,
            row.sy2024_25_grade_level,
            row.status
        ];
        return values.map(value => {
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(',');
    });

    return [columns.join(','), ...rows].join('\n');
}; 
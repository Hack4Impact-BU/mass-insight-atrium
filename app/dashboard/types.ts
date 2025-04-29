export type TimeFilterOption = '7days' | '30days' | '90days' | 'custom';

export type OverviewType = {
    totalRegistrations: number;
    attendeeAttendance: number;
    attendeeRetention: number;
    participationBySchool: Record<string, number>;
    attendanceOverTime: Array<{
        date: string;
        count: number;
        meetingName: string;
    }>;
    timeRange: {
        start: Date;
        end: Date;
    };
};

export type EventType = {
    meeting_id: number;
    name: string;
    start_time: string;
    end_time: string;
};

export type StudentType = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role_profile: string;
    race_ethnicity: string;
    state_work: string;
    district_name: string;
    school_name: string;
};

export type DetailedAttendanceData = {
    meeting_name: string;
    meeting_date: string;
    attendee_name: string;
    attendee_email: string;
    school_name: string;
    district_name: string;
    role_profile: string;
    race_ethnicity: string;
    status: string;
}; 
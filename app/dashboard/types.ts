export type TimeFilterOption = '7days' | '30days' | '90days' | 'custom';

export type OverviewType = {
    totalRegistrations: number;
    attendeeAttendance: number;
    attendeeRetention: number;
    participationBySchool: Record<string, number>;
    participationByDistrict: Record<string, number>;
    participationByState: Record<string, number>;
    participationByRole: Record<string, number>;
    participationByContentArea: Record<string, number>;
    participationByGrade: Record<number, number>;
    participationByCourse: Record<string, number>;
    participationByRace: Record<string, number>;
    attendanceOverTime: Array<{
        date: string;
        count: number;
        meetingName: string;
        meetingId: number;
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
    date_of_birth: string | null;
    content_area: string | null;
    sy2024_25_course: string | null;
    sy2024_25_grade_level: number | null;
};

export type DetailedAttendanceData = {
    meeting_name: string;
    meeting_date: string;
    meeting_start_time: string;
    meeting_end_time: string;
    attendee_name: string;
    attendee_email: string;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    role_profile: string;
    race_ethnicity: string;
    state_work: string;
    school_name: string;
    district_name: string;
    content_area: string | null;
    sy2024_25_course: string | null;
    sy2024_25_grade_level: number | null;
    status: string;
}; 
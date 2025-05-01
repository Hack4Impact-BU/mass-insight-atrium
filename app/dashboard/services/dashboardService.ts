import { createClient } from "@/utils/supabase/client";
import { OverviewType, EventType, StudentType, DetailedAttendanceData } from '../types';

export class DashboardService {
    private supabase = createClient();

    async fetchDashboardData(timeRange: { start: Date; end: Date }) {
        try {
            // Fetch meetings for attendance over time
            const { data: meetings, error: meetingsError } = await this.supabase
                .from("meetings")
                .select("*")
                .gte("start_time", timeRange.start.toISOString())
                .lte("start_time", timeRange.end.toISOString())
                .order("start_time", { ascending: true });

            if (meetingsError) throw new Error('Failed to fetch meetings data');

            // Fetch upcoming meetings separately
            const now = new Date();
            const { data: upcomingMeetings, error: upcomingError } = await this.supabase
                .from("meetings")
                .select("*")
                .gte("start_time", now.toISOString())
                .order("start_time", { ascending: true })
                .limit(2);

            if (upcomingError) throw new Error('Failed to fetch upcoming meetings');

            // Fetch invitees with status for the time range
            const { data: invitees, error: inviteesError } = await this.supabase
                .from("invitees")
                .select("*")
                .in("meeting_id", meetings?.map(m => m.meeting_id) || []);

            if (inviteesError) throw new Error('Failed to fetch attendance data');

            // Fetch all people (not filtered by time range)
            const { data: people, error: peopleError } = await this.supabase
                .from("people")
                .select("*")
                .not('role_profile', 'eq', 'admin')  // Exclude admin users
                .order('last_name', { ascending: true });

            if (peopleError) throw new Error('Failed to fetch people data');
            console.log('Found people:', people?.length || 0);

            // Get unique school and district IDs
            const schoolIds = [...new Set(
                people
                    ?.filter(p => p.school_id !== null)
                    .map(p => p.school_id as number) || []
            )];
            const districtIds = [...new Set(
                people
                    ?.filter(p => p.district_id !== null)
                    .map(p => p.district_id as number) || []
            )];

            console.log('Unique school IDs:', schoolIds.length, 'district IDs:', districtIds.length);

            // Fetch schools and districts
            const { data: schools, error: schoolsError } = await this.supabase
                .from("schools")
                .select("*")
                .in("id", schoolIds.length > 0 ? schoolIds : [0])
                .order('name', { ascending: true });

            if (schoolsError) throw new Error('Failed to fetch school data');
            console.log('Found schools:', schools?.length || 0);

            const { data: districts, error: districtsError } = await this.supabase
                .from("districts")
                .select("*")
                .in("id", districtIds.length > 0 ? districtIds : [0])
                .order('name', { ascending: true });

            if (districtsError) throw new Error('Failed to fetch district data');
            console.log('Found districts:', districts?.length || 0);

            return this.processDashboardData(
                meetings || [],
                upcomingMeetings || [],
                invitees || [],
                people || [],
                schools || [],
                districts || [],
                timeRange
            );
        } catch (error) {
            console.error('Error in fetchDashboardData:', error);
            throw error;
        }
    }

    async fetchDetailedAttendanceData(timeRange: { start: Date; end: Date }): Promise<DetailedAttendanceData[]> {
        try {
            console.log('Fetching data for time range:', timeRange);
            
            // Fetch all necessary data
            const { data: meetings, error: meetingsError } = await this.supabase
                .from("meetings")
                .select("*")
                .gte("start_time", timeRange.start.toISOString())
                .lte("start_time", timeRange.end.toISOString())
                .order("start_time", { ascending: true });

            if (meetingsError) throw new Error('Failed to fetch meetings data');
            console.log('Found meetings:', meetings?.length || 0);
            if (!meetings || meetings.length === 0) return [];

            // Fetch all invitees for these meetings, not just PARTICIPATED
            const { data: invitees, error: inviteesError } = await this.supabase
                .from("invitees")
                .select("*")
                .in("meeting_id", meetings.map(m => m.meeting_id));

            if (inviteesError) throw new Error('Failed to fetch attendance data');
            console.log('Found invitees:', invitees?.length || 0);
            if (!invitees || invitees.length === 0) return [];

            // Get unique emails from invitees
            const uniqueEmails = [...new Set(invitees.map(i => i.email_address))];
            console.log('Unique emails:', uniqueEmails.length);

            const { data: people, error: peopleError } = await this.supabase
                .from("people")
                .select("*")
                .in("email", uniqueEmails);

            if (peopleError) throw new Error('Failed to fetch people data');
            console.log('Found people:', people?.length || 0);
            if (!people || people.length === 0) return [];

            const schoolIds = people
                .filter(p => p.school_id !== null)
                .map(p => p.school_id as number);

            const districtIds = people
                .filter(p => p.district_id !== null)
                .map(p => p.district_id as number);

            console.log('School IDs:', schoolIds.length, 'District IDs:', districtIds.length);

            const { data: schools } = await this.supabase
                .from("schools")
                .select("*")
                .in("id", schoolIds.length > 0 ? schoolIds : [0]);

            const { data: districts } = await this.supabase
                .from("districts")
                .select("*")
                .in("id", districtIds.length > 0 ? districtIds : [0]);

            console.log('Found schools:', schools?.length || 0, 'districts:', districts?.length || 0);

            // Process the data - include all attendance statuses
            const detailedData: DetailedAttendanceData[] = [];
            invitees.forEach(invitee => {
                const meeting = meetings.find(m => m.meeting_id === invitee.meeting_id);
                const person = people.find(p => p.email === invitee.email_address);
                const school = person?.school_id && schools ? schools.find(s => s.id === person.school_id) : null;
                const district = person?.district_id && districts ? districts.find(d => d.id === person.district_id) : null;

                if (meeting && person) {
                    detailedData.push({
                        meeting_name: meeting.name,
                        meeting_date: new Date(meeting.start_time).toLocaleDateString(),
                        meeting_start_time: meeting.start_time,
                        meeting_end_time: meeting.end_time,
                        attendee_name: `${person.first_name} ${person.last_name}`,
                        attendee_email: person.email || '',
                        first_name: person.first_name,
                        last_name: person.last_name,
                        date_of_birth: person.date_of_birth || null,
                        role_profile: person.role_profile || '',
                        race_ethnicity: person.race_ethnicity || '',
                        state_work: person.state_work || '',
                        school_name: school?.name || '',
                        district_name: district?.name || '',
                        content_area: (person as any).content_area || null,
                        sy2024_25_course: (person as any).sy2024_25_course || null,
                        sy2024_25_grade_level: (person as any).sy2024_25_grade_level || null,
                        status: invitee.status
                    });
                }
            });

            console.log('Processed detailed data:', detailedData.length);
            return detailedData;
        } catch (error) {
            console.error('Error fetching detailed attendance data:', error);
            throw error;
        }
    }

    private processDashboardData(
        meetings: any[],
        upcomingMeetings: any[],
        invitees: any[],
        people: any[],
        schools: any[],
        districts: any[],
        timeRange: { start: Date; end: Date }
    ) {
        console.log('Processing dashboard data with:', {
            meetings: meetings.length,
            upcomingMeetings: upcomingMeetings.length,
            invitees: invitees.length,
            people: people.length,
            schools: schools.length,
            districts: districts.length
        });

        // Calculate attendance over time
        const attendanceOverTime = meetings.map(meeting => {
            const meetingAttendees = invitees.filter(
                inv => inv.meeting_id === meeting.meeting_id && inv.status === "PARTICIPATED"
            );
            return {
                date: meeting.start_time,
                count: meetingAttendees.length,
                meetingName: meeting.name,
                meetingId: meeting.meeting_id
            };
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        console.log('Attendance over time:', attendanceOverTime);

        // Overview metrics
        const totalRegistrations = invitees.length;
        const attendeeAttendance = invitees.filter(i => i.status === "PARTICIPATED").length;
        const attendeeRetention = totalRegistrations > 0 
            ? Math.round((attendeeAttendance / totalRegistrations) * 100) 
            : 0;

        console.log('Overview metrics:', {
            totalRegistrations,
            attendeeAttendance,
            attendeeRetention
        });
        
        // Participation metrics
        const participationBySchool: Record<string, number> = {};
        const participationByDistrict: Record<string, number> = {};
        const participationByState: Record<string, number> = {};
        const participationByRole: Record<string, number> = {};
        const participationByContentArea: Record<string, string> = {};
        const participationByGrade: Record<number, number> = {};
        const participationByCourse: Record<string, string> = {};
        const participationByRace: Record<string, number> = {};

        console.log('Starting participation metrics calculation');
        
        let participatedCount = 0;
        let matchedWithPersonCount = 0;
        let matchedWithSchoolCount = 0;

        invitees.forEach(inv => {
            if (inv.status === "PARTICIPATED") {
                participatedCount++;
                const person = people.find(p => p.email === inv.email_address);
                
                if (person) {
                    matchedWithPersonCount++;

                    // School participation
                    if (person.school_id) {
                        const school = schools.find(s => s.id === person.school_id);
                        if (school) {
                            matchedWithSchoolCount++;
                            participationBySchool[school.name] = (participationBySchool[school.name] || 0) + 1;
                        }
                    }

                    // District participation
                    if (person.district_id) {
                        const district = districts.find(d => d.id === person.district_id);
                        if (district) {
                            participationByDistrict[district.name] = (participationByDistrict[district.name] || 0) + 1;
                        }
                    }

                    // State work participation
                    if (person.state_work) {
                        participationByState[person.state_work] = (participationByState[person.state_work] || 0) + 1;
                    }

                    // Role profile participation
                    if (person.role_profile) {
                        participationByRole[person.role_profile] = (participationByRole[person.role_profile] || 0) + 1;
                    }

                    // Content area participation (store as comma-separated string)
                    if (person.content_area) {
                        participationByContentArea[person.email] = person.content_area;
                    }

                    // Grade level participation
                    if (person.sy2024_25_grade_level !== null) {
                        participationByGrade[person.sy2024_25_grade_level] = 
                            (participationByGrade[person.sy2024_25_grade_level] || 0) + 1;
                    }

                    // Course participation (store as comma-separated string)
                    if (person.sy2024_25_course) {
                        participationByCourse[person.email] = person.sy2024_25_course;
                    }

                    // Race/Ethnicity participation
                    if (person.race_ethnicity) {
                        participationByRace[person.race_ethnicity] = 
                            (participationByRace[person.race_ethnicity] || 0) + 1;
                    }
                }
            }
        });

        console.log('Participation calculation results:', {
            totalParticipated: participatedCount,
            matchedWithPerson: matchedWithPersonCount,
            matchedWithSchool: matchedWithSchoolCount,
            schoolsFound: Object.keys(participationBySchool).length,
            districtsFound: Object.keys(participationByDistrict).length,
            rolesFound: Object.keys(participationByRole).length
        });
        console.log('Participation by school data:', participationBySchool);

        // Student data table - include all students regardless of participation
        const studentData = people.map(person => {
            const school = schools?.find(s => s.id === person.school_id);
            const district = districts?.find(d => d.id === person.district_id);
            return {
                id: person.id,
                first_name: person.first_name,
                last_name: person.last_name,
                email: person.email || '',
                role_profile: person.role_profile || '',
                race_ethnicity: person.race_ethnicity || '',
                state_work: person.state_work || '',
                school_name: school?.name || '',
                district_name: district?.name || '',
                date_of_birth: person.date_of_birth || null,
                content_area: person.content_area || null,
                sy2024_25_course: person.sy2024_25_course || null,
                sy2024_25_grade_level: person.sy2024_25_grade_level || null
            } as StudentType;
        });

        console.log('Processed student data:', studentData.length);

        const overview: OverviewType = {
            totalRegistrations,
            attendeeAttendance,
            attendeeRetention,
            participationBySchool,
            participationByDistrict,
            participationByState,
            participationByRole,
            participationByContentArea,
            participationByGrade,
            participationByCourse,
            participationByRace,
            attendanceOverTime,
            timeRange
        };

        return {
            overview,
            upcomingEvents: upcomingMeetings as EventType[],
            studentData
        };
    }
} 
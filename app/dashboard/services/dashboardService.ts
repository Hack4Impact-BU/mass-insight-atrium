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
                        attendee_name: `${person.first_name} ${person.last_name}`,
                        attendee_email: person.email || '',
                        school_name: school?.name || '',
                        district_name: district?.name || '',
                        role_profile: person.role_profile || '',
                        race_ethnicity: person.race_ethnicity || '',
                        status: invitee.status // Add status to see what's happening
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
                meetingName: meeting.name
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
        
        // Participation by school
        const participationBySchool: Record<string, number> = {};
        console.log('Starting participation by school calculation');
        console.log('Total invitees to process:', invitees.length);
        
        let participatedCount = 0;
        let matchedWithPersonCount = 0;
        let matchedWithSchoolCount = 0;

        invitees.forEach(inv => {
            if (inv.status === "PARTICIPATED") {
                participatedCount++;
                const person = people.find(p => p.email === inv.email_address);
                console.log('Participant details:', {
                    inviteeEmail: inv.email_address,
                    meetingId: inv.meeting_id,
                    personFound: !!person,
                    personDetails: person ? {
                        name: `${person.first_name} ${person.last_name}`,
                        email: person.email,
                        schoolId: person.school_id,
                        districtId: person.district_id,
                        roleProfile: person.role_profile
                    } : null
                });
                if (person) {
                    matchedWithPersonCount++;
                    if (person.school_id) {
                        const school = schools.find(s => s.id === person.school_id);
                        if (school) {
                            matchedWithSchoolCount++;
                            participationBySchool[school.name] = (participationBySchool[school.name] || 0) + 1;
                            console.log('School match found:', {
                                personName: `${person.first_name} ${person.last_name}`,
                                schoolName: school.name
                            });
                        } else {
                            console.log('No school found for ID:', person.school_id);
                        }
                    } else {
                        console.log('No school ID for person:', `${person.first_name} ${person.last_name}`);
                    }
                }
            }
        });

        console.log('Participation calculation results:', {
            totalParticipated: participatedCount,
            matchedWithPerson: matchedWithPersonCount,
            matchedWithSchool: matchedWithSchoolCount,
            schoolsFound: Object.keys(participationBySchool).length
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
                district_name: district?.name || ''
            } as StudentType;
        });

        console.log('Processed student data:', studentData.length);

        const overview: OverviewType = {
            totalRegistrations,
            attendeeAttendance,
            attendeeRetention,
            participationBySchool,
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
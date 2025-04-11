"use client"
import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Gauge } from '@mui/x-charts/Gauge';
import { PieChart } from '@mui/x-charts/PieChart';
import { getNumOfAttendees } from '../../utils/meetingStats/getAttendees';
import { getNumOfStudentsPerSchool } from '../../utils/meetingStats/getSchool';
import { getNumOfInvitedRatio } from '../../utils/meetingStats/getInvited';
import { meetingData, userData } from '../../utils/meetingStats/testData';

const Page: React.FC = () => {
    const meetingID = "meeting1"
    const attendeesNum = getNumOfAttendees(meetingID, meetingData);
    const schoolInfo = getNumOfStudentsPerSchool(meetingID, meetingData, userData);
    const getInvited = getNumOfInvitedRatio(meetingID, meetingData);

    const chartData = Object.entries(schoolInfo).map(([key, value], index) => ({
        id: index,
        value: value,
        label: "School "+key,
      }));

return (
    <div>
        <div className="p-10">
            <div className="border border-[#0D99FF] bg-[#E0F3FF]">
                <p className="ml-10 text-3xl font-semibold mt-6 text-[#022C4D]">Overview</p>
                <p className='text-sm text-[#929292] ml-10 mt-1'>For meetingID: {meetingID}</p>
                <div className='flex flex-wrap justify-center'>
                    <div className="border-r-2 border-r-[#0D99FF] mt-4 mb-4 p-6 text-center w-2/6">
                        <p className='text-lg text-[#006EB6] font-medium'>Attendee Attendance</p>
                        <BarChart
                            series={[
                                { data: [attendeesNum.length] },
                            ]}
                            height={200}
                            xAxis={[{ data: [meetingID], scaleType: 'band' }]}
                            margin={{ top: 30, bottom: 20, left: 40, right: 10 }}
                        />
                    </div>

                    <div className="border-r-2 border-r-[#0D99FF] mt-4 mb-4 p-6 text-center w-1/6">
                        <p className='text-lg text-[#006EB6] font-medium'>Total Registrations</p>
                        <div>
                            <p className='text-4xl font-medium mt-24'>{getInvited.length}</p>
                        </div>
                    </div>
                
                    <div className="border-r-2 border-r-[#0D99FF] mt-4 mb-4 p-6 text-center w-1/6">
                        <p className='text-lg text-[#006EB6] font-medium'>Attendee Retention - %</p>
                        <div className='flex justify-center mt-10'><Gauge width={150} height={150} value={attendeesNum.length/getInvited.length*100} /></div>
                    </div>
                    
                    <div className="mt-4 mb-4 p-6 text-center 2/6">
                        <p className='text-lg text-[#006EB6] font-medium'>Participation By School</p>
                        <div className='mt-4'>
                            <PieChart
                                series={[{data: chartData}]}
                                width={400}
                                height={150}
                                />
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
  );
};

export default Page;
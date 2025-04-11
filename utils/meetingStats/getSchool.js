const { getMeeting } = require('./getMeeting.js');

export function getNumOfStudentsPerSchool(meetingID, meetingData, userData){
    const meeting = getMeeting(meetingData, meetingID)

    const result = {};
    for (let x in userData) {
        if (meeting.attendees.includes(x)) {
            result[userData[x].school] = (result[userData[x].school] || 0) + 1;
        }
    }
    console.log(result)
    return result;
}
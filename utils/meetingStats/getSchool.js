const { getMeeting } = require('./getMeeting.js');
const { meetingData, userData } = require('./testData.js')

  function getNumOfStudentsPerSchool(meetingData, userData, meetingID){
    const meeting = getMeeting(meetingData, meetingID)

    const result = {};
    for (let x in userData) {
        if (meeting.attendees.includes(x)) {
            result[userData[x].school] = (result[userData[x].school] || 0) + 1;
        } 
    }
    return result;
}
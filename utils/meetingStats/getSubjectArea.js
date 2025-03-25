const { getMeeting } = require('./getMeeting.js');
const { meetingData, userData } = require('./testData.js')

  function getNumOfStudentPerSubject(meetingData, userData, meetingID){
    const meeting = getMeeting(meetingData, meetingID)

    const result = {};
    for (let x in userData) {
        if (meeting.attendees.includes(x)) {
            result[userData[x].subject] = (result[userData[x].subject] || 0) + 1;
        } 
    }
    return result;
}
function getMeeting(meetingData, meetingID){
   const meeting = meetingData.find(m => m.id === meetingID);
    if (!meeting) {
        console.error("Meeting not found");
        return {};
    }
    return meeting;
}
module.exports = { getMeeting };
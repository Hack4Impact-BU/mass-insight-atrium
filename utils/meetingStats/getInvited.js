export function getNumOfInvitedRatio(meetingID, meetingData) {
    let totalInvites = [];
    for (let x = 0; x < meetingData.length; x++) {
        if (meetingData[x].id === meetingID) {
            totalInvites = meetingData[x].invitees;
        }
    }
    return totalInvites;
}
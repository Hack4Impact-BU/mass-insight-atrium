export function getNumOfAttendees(meetingID, meetingData){
    let totalStudents = []
    for (let x=0; x < meetingData.length; x++){
        if(meetingData[x].id == meetingID){
            totalStudents = meetingData[x].attendees;
        }
    }
    return totalStudents;
}
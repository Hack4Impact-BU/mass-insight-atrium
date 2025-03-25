const { meetingData } = require('./testData.js')

function getNumOfAttendees(meetingID, meetingData){
    for (let x=0; x < meetingData.length; x++){
        if(meetingData[x].id == meetingID){
            return meetingData[x].attendees;
        }
    }
  }

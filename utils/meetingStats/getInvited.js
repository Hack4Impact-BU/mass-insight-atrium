const { meetingData } = require('./testData.js')
  
  function getNumOfInvited(meetingID, meetingData){
    for (let x=0; x < meetingData.length; x++){
        if(meetingData[x].id == meetingID){
            return meetingData.attendees.length / meetingData.invitees.length;
        }
    }
  }

const meetingData = [
    {
      id: 'meeting1',
      invitees: [ 'student1', 'student2', 'student3', 'student4' ],
      attendees: [ 'student1', 'student2' ]
    },
    {
      id: 'meeting2',
      invitees: [ 'student1', 'student2', 'student3', 'student4' ],
      attendees: [ 'student1', 'student2' ]
    },
  ];


const userData = {
    student1: { subject: 'Math', school: 'A', grade: 10 },
    student2: { subject: 'Science', school: 'B', grade: 11 },
    student3: { subject: 'Math', school: 'A', grade: 10 },
    student4: { subject: 'History', school: 'C', grade: 12 },
  };

  module.exports = { meetingData, userData };
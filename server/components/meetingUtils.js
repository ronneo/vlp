const matchMeetings = ((meetings, settings) => {
    if (settings === undefined) return null

    //logic for all the black box magic happens here

    const freeMeetings = meetings.filter((meeting)=> {
        if (meeting.attendees.length >= 0 && meeting.attendees <= 1) {
            return true
        }
        return false
    })
    if (freeMeetings.length === 0) {
        return null
    } else {
        return freeMeetings[0]
    }
})

const removeMeeting = ((meetings, meetingID) => {
    const sIndex = meetings.findIndex((element) => {
        element.meeting.Meeting.MeetingId === meetingID
    })
    meetings.splice(sIndex, 1)
    return meetings
})

module.exports = {
    matchMeetings,
    removeMeeting
}
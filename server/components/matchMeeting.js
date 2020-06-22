const matchMeeting = ((meetings, settings) => {
    if (settings === undefined) return null

    const freeMeetings = meetings.filter((meeting)=> {
        if (meeting.attendees.length === 1) {
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

module.exports = matchMeeting
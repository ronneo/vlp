const express = require('express')
const router = express.Router()
const AWS = require('aws-sdk')
const uuid = require('uuid/v4')

const meetingTable = {}
AWS.config.loadFromPath('./aws.json')
const chime = new AWS.Chime({ region: 'us-east-1' })
chime.endpoint = new AWS.Endpoint(process.env.ENDPOINT || 'https://service.chime.aws.amazon.com')

router.post('/launch/:meeting?', async (req, res) => {
	let reqMeeting = req.params.meeting
	console.log('received meeting key: '+reqMeeting);
	if (!meetingTable[reqMeeting]) {
		meetingTable[reqMeeting] = {}

		meetingTable[reqMeeting].meeting = await chime.createMeeting({
			// Use a UUID for the client request token to ensure that any request retries
			// do not create multiple meetings.
			ClientRequestToken: uuid(),
			// Specify the media region (where the meeting is hosted).
			// https://docs.aws.amazon.com/general/latest/gr/rande.html
			MediaRegion: "us-east-1",
			// Any meeting ID you wish to associate with the meeting.
			ExternalMeetingId: reqMeeting.substring(0, 64),
		}).promise();
		console.log('Creating new Meeting')
	}

	const meeting = meetingTable[reqMeeting].meeting;
	console.log('logging into meeting ID: '+meeting.Meeting.MeetingId)
	const attendee = await chime.createAttendee({
		// The meeting ID of the created meeting to add the attendee to
		MeetingId: meeting.Meeting.MeetingId,

		// Any user ID you wish to associate with the attendeee.
		ExternalUserId: `${uuid().substring(0, 8)}#${reqMeeting}`.substring(0, 64),
	}).promise()

	res.json({meetingInfo:meeting, attendeeInfo:attendee})
})

router.post('/feedback/', (req, res) => {
	/* process feedback */
	res.json({success:true})
});

module.exports = router
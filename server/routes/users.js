const express = require('express')
const router = express.Router()
const AWS = require('aws-sdk')
const uuid = require('uuid/v4')
const matchMeetings = require('../components/matchMeeting')

const meetingTable = []
AWS.config.loadFromPath('./aws.json')
const chime = new AWS.Chime({ region: 'us-east-1' })
chime.endpoint = new AWS.Endpoint(process.env.ENDPOINT || 'https://service.chime.aws.amazon.com')

router.post('/launch/:meeting?', async (req, res) => {
	if (req.body.settings === undefined) {
		res.json({status:'error'})
		return
	}

	let acceptedMeeting = null
	let username = req.body.settings.displayName

	if (username === '') {
		username = 'user_'+uuid().substring(0, 8)
	}

	console.log('user logging in', req.body.settings)
	const matchedMeeting = matchMeetings(meetingTable, req.body.settings)

	if (matchedMeeting === null) {
		acceptedMeeting = {}

		try {
			acceptedMeeting.meeting = await chime.createMeeting({
				ClientRequestToken: uuid(),
				// https://docs.aws.amazon.com/general/latest/gr/rande.html
				MediaRegion: "us-east-1",
				ExternalMeetingId: uuid().substring(0, 64),
			}).promise();
		} catch (error) {
			//cannot create meeting for some reason
			console.log('Create meeting error', error)
		}
		acceptedMeeting.attendees = []
		meetingTable.push(acceptedMeeting)
		console.log('Creating new Meeting')
	} else {
		acceptedMeeting = matchedMeeting
	}

	console.log(acceptedMeeting)
	const attendee = await chime.createAttendee({
		// The meeting ID of the created meeting to add the attendee to
		MeetingId: acceptedMeeting.meeting.Meeting.MeetingId,

		// Any user ID you wish to associate with the attendeee.
		ExternalUserId: `${uuid().substring(0, 8)}#${username}`.substring(0, 64),
		Tags: [
			{Key:'name', Value:username}
		]
	}).promise()
	acceptedMeeting.attendees.push(attendee)

	res.json({meetingInfo:acceptedMeeting.meeting, attendeeInfo:attendee})
})

router.post('/feedback/', (req, res) => {
	/* process feedback */
	res.json({success:true})
});

module.exports = router
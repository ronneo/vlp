import React, { useState, useEffect } from 'react'
import { Button } from "@blueprintjs/core"

import DeviceSelector from './DeviceSelector'
import VideoChat from './VideoChat'
import ChatSetting from './ChatSettings'
import VideoFeedback from './VideoFeedback'

import {
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    LogLevel,
    MeetingSessionConfiguration
} from 'amazon-chime-sdk-js';


const LaunchPad = () => {
	let attendee = {}
	let meeting = {}
	const [meetingSession, setMeetingSession] = useState<DefaultMeetingSession | undefined>(undefined)
	const [audioInputDevice, setAudioInputDevice] = useState('')
	const [audioOutputDevice, setAudioOutputDevice] = useState('')
	const [videoInputDevice, setVideoInputDevice] = useState('')
	const [stage, setStage] = useState(0);
	const [userAttributes, setUserAttributes] = useState({})
	const [feedback, setFeedback] = useState({})
	const [loading, setLoading] = useState(false)

	const logger = new ConsoleLogger('Device logger', LogLevel.INFO);
	const deviceController = new DefaultDeviceController(logger);

	const launchMeetingSetup = () => {
		if (loading) return

		setLoading(true);
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ settings:userAttributes })
		};
		
		fetch('/users/launch/testmeeting7', requestOptions)
		.then(response => response.json())
		.then(data => {
			attendee = data.attendeeInfo
			meeting = data.meetingInfo
			setLoading(false);

			const configuration = new MeetingSessionConfiguration(meeting, attendee)
			setMeetingSession(new DefaultMeetingSession(
				configuration,
				logger,
				deviceController
			))

			setStage(1)
		});
	}

	const startMeeting = () => {
		if (meetingSession === undefined) return
		setStage(2)
	}

	const leaveMeeting = () => {
		setStage(3);
	}

	const sendFeedback = () => {
		setStage(0)
	}

    useEffect(() => {
		const updateAudioVideo = async () => {
			if (meetingSession === undefined) return

			if (audioInputDevice !== '') {
				await meetingSession.audioVideo.chooseAudioInputDevice(audioInputDevice);
			}	
		}
		updateAudioVideo()
    }, [audioInputDevice, meetingSession])
    useEffect(() => {
		const updateAudioVideo = async () => {
			if (meetingSession === undefined) return

			if (audioOutputDevice !== '') {
				await meetingSession.audioVideo.chooseAudioOutputDevice(audioOutputDevice);
			}	
		}
		updateAudioVideo()
    }, [audioOutputDevice, meetingSession])
    useEffect(() => {
		const updateAudioVideo = async () => {
			if (meetingSession === undefined) return

			if (videoInputDevice !== '') {
				await meetingSession.audioVideo.chooseVideoInputDevice(videoInputDevice);
			}	
		}
		updateAudioVideo()
	}, [videoInputDevice, meetingSession])
	useEffect(() => {
		console.log('Receive feedback: ', feedback)
	}, [feedback])

	const renderStage = () => {
		switch(stage) {
			case 0: return (<div className="setupchat">
				<ChatSetting updateAttribute={setUserAttributes} />
				<Button icon="play" onClick={launchMeetingSetup} loading={loading} intent="primary" text="Set up new Chat" />
				</div>)
			case 1: return (<div>
				<DeviceSelector meetingSession={meetingSession} 
				setAudioInputDevice={setAudioInputDevice}
				audioInputDevice={audioInputDevice}
				setAudioOutputDevice={setAudioOutputDevice}
				audioOutputDevice={audioOutputDevice}
				setVideoInputDevice={setVideoInputDevice}
				videoInputDevice={videoInputDevice} />
				<div className="startchat">
					<Button rightIcon="arrow-right" onClick={startMeeting} intent="primary" text="Start Chat" />
				</div>
			</div>)
			case 2: 
				if (meetingSession === undefined) return <div />
				return <VideoChat leave={leaveMeeting} meetingSession={meetingSession} setFeedback={setFeedback} />
			case 3:
				return <VideoFeedback onSubmit={sendFeedback} attendee={attendee} feedback={feedback} />
		}
	}

	return (<div className="launchpad">
		{renderStage()}
	</div>)
}

export default LaunchPad
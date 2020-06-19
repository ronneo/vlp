import React, { useState, useEffect } from 'react';    
import { Card, HTMLSelect, Label } from "@blueprintjs/core";
import {
    DefaultMeetingSession,
} from 'amazon-chime-sdk-js';

type Props = {
    audioInputDevice: string
    setAudioInputDevice: (value:string) => void
    audioOutputDevice: string
    setVideoInputDevice: (value:string) => void
    videoInputDevice: string
    setAudioOutputDevice: (value:string) => void
    meetingSession: DefaultMeetingSession | undefined
}

const DeviceSelector = (props:Props) => {
    const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[] | []>([])
    const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[] | []>([])
    const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[] | []>([])

    useEffect(() => {
        const setUp = async() => {
            if (props.meetingSession === undefined) return undefined

            return [
                await props.meetingSession.audioVideo.listAudioInputDevices(),
                await props.meetingSession.audioVideo.listAudioOutputDevices(),
                await props.meetingSession.audioVideo.listVideoInputDevices()
            ]
        }

        setUp().then((data:MediaDeviceInfo[][] | undefined)=> {
            //detect if device has no available input or output
            //eg no camera, microphone etc
            if (props.meetingSession === undefined || data === undefined) return

            setAudioInputDevices(data[0])
            setAudioOutputDevices(data[1])
            setVideoInputDevices(data[2])
        })

    }, [props.meetingSession])

    useEffect(() => {
        if (audioInputDevices.length === 0) return;
        props.setAudioInputDevice(audioInputDevices[0].deviceId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioInputDevices])
    useEffect(() => {
        if (audioOutputDevices.length === 0) return;
        props.setAudioOutputDevice(audioOutputDevices[0].deviceId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioOutputDevices])
    useEffect(() => {
        if (videoInputDevices.length === 0) return;
        props.setVideoInputDevice(videoInputDevices[0].deviceId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoInputDevices])

    return (<div className="deviceselector">
        <Card>
            <h3>Video configurations</h3>
        <Label>
            Select your Microphone
            <HTMLSelect onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => props.setAudioInputDevice(evt.target.value)}>
                {(audioInputDevices as Array<MediaDeviceInfo>).map((mediaDeviceInfo:any) => {
                    return <option key={mediaDeviceInfo.deviceId} value={mediaDeviceInfo.deviceId}>{mediaDeviceInfo.label}</option>
                })}
            </HTMLSelect>
        </Label>
        <Label>
            Select your Speaker
            <HTMLSelect onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => props.setAudioOutputDevice(evt.target.value)}>
                {(audioOutputDevices as Array<MediaDeviceInfo>).map((mediaDeviceInfo:any) => {
                    return <option key={mediaDeviceInfo.deviceId} value={mediaDeviceInfo.deviceId}>{mediaDeviceInfo.label}</option>
                })}
            </HTMLSelect>
        </Label>
        <Label>
            Select your Camera
            <HTMLSelect onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => props.setVideoInputDevice(evt.target.value)}>
                {(videoInputDevices as Array<MediaDeviceInfo>).map((mediaDeviceInfo:any) => {
                    return <option key={mediaDeviceInfo.deviceId} value={mediaDeviceInfo.deviceId}>{mediaDeviceInfo.label}</option>
                })}
            </HTMLSelect>
        </Label>
        </Card>
    </div>)
}

export default DeviceSelector
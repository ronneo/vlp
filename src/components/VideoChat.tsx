import React, { useEffect, useRef } from 'react';    
import { Card, Button, Intent } from "@blueprintjs/core";
import * as faceapi from 'face-api.js'
import { VideoToaster } from './VideoToaster'
import {
    DefaultMeetingSession,
} from 'amazon-chime-sdk-js';
import { FaceDetection, FaceExpressions } from 'face-api.js';

type Props = {
    meetingSession: DefaultMeetingSession,
    leave: () => void,
    setFeedback: (x:any) => void
}

const VideoChat = (props:Props) => {

    const audioRef:any = useRef(null)
    const localVideoRef:any = useRef(null)
    const remoteVideoRef:any = useRef(null)
    let modelsLoaded:boolean = false
    let setToaster:boolean = false
    let faceTrackingInt:number = 0
    let faceTrackingResults:any = {
        count:0,
        positive:0,
        negative:0,
        happy:0,
    }

    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        //faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        //faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]).then(() => {
        modelsLoaded = true
    })

    const AVobserver = {
        audioVideoDidStart: () => {
        },
        audioVideoDidStop: (sessionStatus:any) => {
        },
        audioVideoDidStartConnecting: (reconnecting:any) => {
        },
        videoTileDidUpdate: (tileState:any) => {
            console.log('attendeeId: '+tileState.boundAttendeeId)
            if (tileState.localTile) {
                props.meetingSession.audioVideo.bindVideoElement(tileState.tileId, localVideoRef.current);
            }
            if (!tileState.boundAttendeeId || tileState.localTile || tileState.isContent) {
                return
            }
            props.meetingSession.audioVideo.bindVideoElement(tileState.tileId, remoteVideoRef.current);
        },
    }

    const leaveChat = () => {
        window.clearInterval(faceTrackingInt)
        props.meetingSession.audioVideo.stopLocalVideoTile();
        props.meetingSession.audioVideo.removeObserver(AVobserver)
        props.meetingSession.audioVideo.stop();
        props.setFeedback({
            videoResults: faceTrackingResults
        })
        props.leave()
    }

    useEffect(() => {
        props.meetingSession.audioVideo.bindAudioElement(audioRef.current);

        props.meetingSession.audioVideo.addObserver(AVobserver);
        props.meetingSession.audioVideo.realtimeMuteLocalAudio();
        props.meetingSession.audioVideo.start();
        props.meetingSession.audioVideo.startLocalVideoTile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.meetingSession])

    const initFaceRecongition = () => {
        faceTrackingInt = window.setInterval(async () => {
            if (!modelsLoaded) return

            const faceInfo = await faceapi.detectSingleFace(localVideoRef.current,
                new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
            interpretDetections(faceInfo)
        }, 300)
    }

    const interpretDetections = (faceInfo:{detection:FaceDetection, expressions: FaceExpressions} | undefined) => {
        if (faceInfo === undefined) {
            //no face detected
            console.log('no face located')
            return;
        }
        const expression = faceInfo.expressions

        //Logic for evaluating a good sessions
        faceTrackingResults.count++
        if (expression.angry > 0.5 || expression.disgusted > 0.5 || expression.fearful > 0.5) {
            console.log('Logging negative', faceInfo.expressions)
            //negative experience
            faceTrackingResults.negative++
            if (faceTrackingResults.negative > 10 && !setToaster) {
                setToaster = true
                window.setTimeout(() => {
                    setToaster = false
                }, 5000)
                VideoToaster.show({ intent: Intent.DANGER, message: 'It seems like you are experiencing a difficult situation. Feel free to disconnect from this call and feedback accordingly'})
            }
        } else if (expression.happy > 0.5) {
            console.log('Logging happy', faceInfo.expressions)
            //positive experience
            faceTrackingResults.positive++
            faceTrackingResults.happy += expression.happy
        }
    }

    return (<div className="videochatWrapper">
        <div className="videochat">
            <audio ref={audioRef}></audio>
            <div className="videocont">
                <video className="remoteVideo" ref={remoteVideoRef}></video>
                <video onPlay={initFaceRecongition} className="localVideo" ref={localVideoRef}></video>
            </div>
                <Card className="transcript">
                    <h4>Teleprompter</h4>
                </Card>
        </div>
        <div className="videochatController">
            <Button className="leavebutton" icon="stop" intent="warning" onClick={leaveChat} text="Leave Chat" />
        </div>        
    </div>)
}

export default VideoChat
import React, { useEffect, useRef } from 'react';    
import { Card, Button, Intent } from "@blueprintjs/core";
import * as faceapi from 'face-api.js'
import { VideoToaster } from './VideoToaster'
import VideoPrompter from './VideoPrompter'
import {
    DefaultMeetingSession,
    MeetingSessionStatusCode
} from 'amazon-chime-sdk-js';

type Props = {
    meetingSession: DefaultMeetingSession,
    leave: () => void,
    setFeedback: (x:any) => void
}

const VideoChat = (props:Props) => {

    const styleTranscript = {
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: '20em'
    }
    const styleCanvas = {
        width:'100%',
        height:'50%',
        position:'absolute' as 'absolute',
        top:'50%',
        left:0,
    }
    const styleVideoCont = {
        flexGrow: 1,
        position: 'relative' as 'relative'
    }

    const audioRef:any = useRef(null)
    const localVideoRef:any = useRef(null)
    const remoteVideoRef:any = useRef(null)
    const videoCanvas:any = useRef(null)
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
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]).then(() => {
        modelsLoaded = true
    })

    const AVobserver = {
        audioVideoDidStart: () => {
        },
        audioVideoDidStop: (sessionStatus:any) => {
            const sessionStatusCode = sessionStatus.statusCode();
            if (sessionStatusCode === MeetingSessionStatusCode.AudioCallEnded) {
                leaveChat()
            }
        },
        audioVideoDidStartConnecting: (reconnecting:any) => {
        },
        videoTileDidUpdate: (tileState:any) => {
            console.log('attendeeId: ', tileState)
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
        //props.meetingSession.audioVideo.realtimeMuteLocalAudio();
        props.meetingSession.audioVideo.start();
        props.meetingSession.audioVideo.startLocalVideoTile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.meetingSession])

    const initFaceRecongition = () => {
        const canvasSize = new faceapi.Dimensions(
            localVideoRef.current.clientWidth, 
            localVideoRef.current.clientHeight
        )
        
        console.log('facesize', canvasSize)
        faceapi.matchDimensions(videoCanvas.current, canvasSize)
        faceTrackingInt = window.setInterval(async () => {
            if (!modelsLoaded) return
            
            const faceInfo = await faceapi.detectSingleFace(localVideoRef.current,
                new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
            
            displayDetection(faceInfo, canvasSize)
            interpretDetections(faceInfo)
        }, 200)
    }
    
    const displayDetection = (faceInfo:any | undefined, canvasSize:faceapi.Dimensions) => {
        if (videoCanvas.current === null) return
        videoCanvas.current.getContext('2d').clearRect(0,0,
            videoCanvas.current.clientWidth, videoCanvas.current.clientHeight)

        if (faceInfo === undefined) {
            return
        }
        const detectionSize = faceapi.resizeResults(faceInfo, canvasSize)
        const expression = faceInfo.expressions
        //3 feelings red = bad, green=happy, blue=netrual

        
        if (detectionSize !== undefined) {
            const box = detectionSize.detection.box
            const ctx = videoCanvas.current.getContext('2d')
            
            let maxExpression = 'neutral'
            let maxValue = 0
            let rgbValue = [0,0,0]
            Object.entries(expression).map((element:any) => {
                if (element[1] > maxValue) {
                    maxExpression = element[0]
                    maxValue = element[1]
                }
                if ((element[0] === 'angry' || element[0] === 'disgusted' || element[0] === 'fearful') && element[1] > rgbValue[0]) {
                    rgbValue[0] = element[1]
                }
                if ((element[0] === 'neutral' || element[0] === 'sad') && element[1] > rgbValue[2]) {
                    rgbValue[2] = element[1]
                }
                if ((element[0] === 'happy' || element[0] === 'surprised') && element[1] > rgbValue[1]) {
                    rgbValue[1] = element[1]
                }
                return null
            })
            if (maxExpression === 'angry' || maxExpression === 'disgusted' || maxExpression === 'fearful') {
                ctx.strokeStyle = 'rgb('+(rgbValue[0]*255)+',0,0)'
            } else if (maxExpression === 'neutral' || maxExpression === 'sad') {
                ctx.strokeStyle = 'rgb(0,0,'+(rgbValue[2]*255)+')'
            } else {
                ctx.strokeStyle = 'rgb(0,'+(rgbValue[1]*255)+',0)'
            }
            ctx.lineWidth = 2;
            //flip the box
            ctx.strokeRect(canvasSize.width - (box.left + box.width), box.top, box.width, box.height)
            ctx.font = "18px Georgia";
            ctx.fillStyle = 'white';
            ctx.fillText(maxExpression, canvasSize.width - (box.left + box.width)+4, box.top+16);
        }
    }
    
    const interpretDetections = (faceInfo:any | undefined) => {
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
            //console.log('Logging happy', faceInfo.expressions)
            //positive experience
            faceTrackingResults.positive++
            faceTrackingResults.happy += expression.happy
        }
    }

    return (<div className="videochatWrapper">
        <div className="videochat">
            <audio ref={audioRef}></audio>
            <div style={styleVideoCont}>
                <video className="remoteVideo" ref={remoteVideoRef}></video>
                <video onPlay={initFaceRecongition} className="localVideo" ref={localVideoRef}></video>
                <canvas style={styleCanvas} ref={videoCanvas}></canvas>
            </div>
            <Card style={styleTranscript}>
                <VideoPrompter next={true} />
            </Card>
            
        </div>
        <div className="videochatController">
            <Button className="leavebutton" icon="stop" intent="warning" onClick={leaveChat} text="Leave Chat" />
        </div>        
    </div>)
}

export default VideoChat
import React, { useEffect, useRef, useState } from 'react';    
import { Button, Intent } from "@blueprintjs/core";
import * as faceapi from 'face-api.js'
import { VideoToaster } from './VideoToaster'
import VideoPrompter from './VideoPrompter'
import {
    DefaultMeetingSession,
    MeetingSessionStatusCode
} from 'amazon-chime-sdk-js'

type Props = {
    meetingSession: DefaultMeetingSession,
    meetingActivity: Array<any>,
    leave: () => void,
    setFeedback: (x:any) => void
}

const VideoChat = (props:Props) => {

    const styleTranscript = {
        position: 'absolute' as 'absolute',
        bottom: '1em',
        left:'50%',
        margin: '0 0 0 -200px',
        width:'400px'
    }
    const styleCanvas = {
        width:'50%',
        height:'100%',
        position:'absolute' as 'absolute',
        top:0,
        left:0,
    }
    const styleVideoCont = {
        width:'100%',
        height:'100%'
    }
    const syleRemoteVideo = {
        width:'50%',
        height:'100%'
    }
    const styleLocalVideo = {
        width:'50%',
        height:'100%'
    }
    const styleLeaveBtn = {
        position:'absolute' as 'absolute',
        top: '1em',
        right: '1em'
    }
    const styleDebugMode = {
        position:'absolute' as 'absolute',
        top: '1em',
        left: '1em',
        fontSize:'1.5em',
        background:'#000',
        padding:'10px 20px',
        zIndex: 99
    }

    const [sessionEnd, setSessionEnd] = useState(false)
    const [startVideo, setStartVideo] = useState(false)
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
        trackAlert:0,
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
            setStartVideo(true)
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
            if (localVideoRef.current === null) return

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
        setSessionEnd(true)
        props.leave()
    }

    useEffect(() => {
        if (props.meetingSession === null) return
        props.meetingSession.audioVideo.bindAudioElement(audioRef.current);

        props.meetingSession.audioVideo.addObserver(AVobserver);
        //props.meetingSession.audioVideo.realtimeMuteLocalAudio();
        props.meetingSession.audioVideo.start();
        props.meetingSession.audioVideo.startLocalVideoTile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.meetingSession])

    const initFaceRecongition = () => {
        faceTrackingInt = window.setInterval(async () => {
            if (!modelsLoaded) return
            const canvasSize = new faceapi.Dimensions(
                localVideoRef.current.clientWidth, 
                localVideoRef.current.clientHeight
            )
            faceapi.matchDimensions(videoCanvas.current, canvasSize)

            const faceInfo = await faceapi.detectSingleFace(localVideoRef.current,
                new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
            //const ctx = videoCanvas.current.getContext('2d')
            //videoCanvas.current.getContext('2d').clearRect(0,0,videoCanvas.current.clientWidth, videoCanvas.current.clientHeight)    
            //ctx.strokeRect(100, 100, 200,200)   
    
            displayDetection(faceInfo)
            interpretDetections(faceInfo)
        }, 200)
    }
    
    const displayDetection = (faceInfo:any | undefined) => {
        if (videoCanvas.current === null) return

        if (faceInfo === undefined) {
            return
        }
        videoCanvas.current.getContext('2d').clearRect(0,0,
            videoCanvas.current.clientWidth, videoCanvas.current.clientHeight)
            
        const scaleRatio = localVideoRef.current.clientWidth/faceInfo.detection.imageWidth > localVideoRef.current.clientHeight/faceInfo.detection.imageHeight?
        localVideoRef.current.clientWidth/faceInfo.detection.imageWidth : localVideoRef.current.clientHeight/faceInfo.detection.imageHeight
        const canvasSize = new faceapi.Dimensions(
            faceInfo.detection.imageWidth*scaleRatio, 
            faceInfo.detection.imageHeight*scaleRatio
        )

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
            ctx.font = "18px Georgia";
            ctx.fillStyle = 'white';

            if (localVideoRef.current.clientWidth/faceInfo.detection.imageWidth < localVideoRef.current.clientHeight/faceInfo.detection.imageHeight) {
                let offset = (faceInfo.detection.imageWidth*scaleRatio - localVideoRef.current.clientWidth)/2
                ctx.strokeRect(canvasSize.width - (box.left + box.width) - offset, box.top, box.width, box.height)
                ctx.fillText(maxExpression, canvasSize.width - (box.left + box.width)+4 - offset, box.top+16);
            } else {
                let offset = (faceInfo.detection.imageHeight*scaleRatio - localVideoRef.current.clientHeight)/2
                ctx.strokeRect(canvasSize.width - (box.left + box.width), box.top - offset, box.width, box.height)
                ctx.fillText(maxExpression, canvasSize.width - (box.left + box.width)+4, box.top+16 - offset);
            }          
        }
    }
    
    const interpretDetections = (faceInfo:any | undefined) => {
        if (faceInfo === undefined) {
            //no face detected
            return;
        }
        const expression = faceInfo.expressions

        //Logic for evaluating a good sessions
        faceTrackingResults.count++
        if (expression.angry > 0.5 || expression.disgusted > 0.5 || expression.fearful > 0.5) {
            //negative experience
            faceTrackingResults.negative++
            faceTrackingResults.trackAlert++
            if (faceTrackingResults.trackAlert > 10 && !setToaster) {
                setToaster = true
                faceTrackingResults.trackAlert = 0
                window.setTimeout(() => {
                    setToaster = false
                }, 5000)
                VideoToaster.show({ intent: Intent.DANGER, message: 'It seems like you are experiencing a difficult situation. Feel free to disconnect from this call and feedback accordingly'})
            }
        } else if (expression.happy > 0.5) {
            //positive experience
            faceTrackingResults.positive++
            faceTrackingResults.happy += expression.happy
        }
    }

    return (<div className="videochatWrapper">
        <div className="videochat">
            <div style={styleDebugMode}>Debug Mode On</div>
            <audio ref={audioRef}></audio>
            <div style={styleVideoCont}>
                <video onPlay={initFaceRecongition} style={styleLocalVideo} ref={localVideoRef}></video>
                <video style={syleRemoteVideo} ref={remoteVideoRef}></video>
                <canvas style={styleCanvas} ref={videoCanvas}></canvas>
            </div>
            <div style={styleTranscript}>
                {startVideo?<VideoPrompter ended={sessionEnd} meetingActivity={props.meetingActivity} />:null}
            </div>
        </div>
        <Button style={styleLeaveBtn} rightIcon="cross" intent="warning" onClick={leaveChat} text="Leave Chat" />       
    </div>)
}

export default VideoChat
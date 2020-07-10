import React, { useState, useEffect } from 'react';    
import { Button } from "@blueprintjs/core";

type Props = {
    ended:boolean,
    meetingActivity: Array<any>,
}

const VideoPrompter = (props:Props) => {
    const [activityCount, setActivityCount] = useState(0)
    const [selectedWord, setSelectedWord] = useState<boolean[]>([])
    let speechAPI:any = null

    const styleMessageBox = {
        borderRadius: 10,
        padding:'20px',
        background:'rgba(0,0,0,0.5)',
        margin:'10px'
    }
    const styleMessageQuestion = {
    }
    const styleMessageTranslate = {
    }
    const styleAnswer = {
        margin:'10px -20px 0 -20px',
    }
    const styleAnswerToken = {
        borderRadius: 10,
        margin: '0 20px',
        background: '#000',
        padding:'10px 20px',
        display: 'inline-block'
    }
    const styleRefresh = {
        margin:'0 20px'
    }
    const styledescriptor = {
        margin:'0 20px 10px 20px',
        color:'#999'
    }
    const startSpeechtoText = () => {
        if (speechAPI !== null) return
        
		if ('speechRecognition' in window) {
			speechAPI = new (window as any).speechRecognition();
		  }
		  else if ('webkitSpeechRecognition' in window) {
			speechAPI = new (window as any).webkitSpeechRecognition();
        }
        speechAPI.continuous = true
		speechAPI.onresult = (e:SpeechRecognitionEvent) => {
            let inputWords = (e.results[e.results.length-1][0].transcript).split(' ')
            let avoidWords = props.meetingActivity[activityCount].avoid
            avoidWords.forEach((word:string, index:number) => {
                if (!inputWords.includes(word)) return

                let newSelect = Array.from(selectedWord)
                newSelect[index] = true
                setSelectedWord(newSelect)
            })
        }
        speechAPI.onspeechstart = () => {
            console.log('speech start')
        }
		speechAPI.start()
    }
    const nextActivity = () => {
        if (activityCount < props.meetingActivity.length-1) {
            setActivityCount(activityCount+1)
        } 
    }
    useEffect(() => {
        let initialArr:Array<boolean> = Array.from(props.meetingActivity[activityCount].avoid, x=>false)
        console.log('new activity', initialArr, props.meetingActivity[activityCount])
        setSelectedWord(initialArr)
    }, [activityCount, props.meetingActivity])

    useEffect(() => {
        console.log('ending speech')
        if (props.ended) {
            speechAPI.stop()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.ended])

    startSpeechtoText()
    const dialog = props.meetingActivity[activityCount]

    return (<div>
        <div>{(activityCount < props.meetingActivity.length-1)?<Button style={styleRefresh} minimal={true} icon="refresh" text="Next Suggestion" onClick={nextActivity} />:null}</div>
        <div style={styleMessageBox}>
            <div style={styleMessageQuestion}>{dialog.question}</div>
            <div style={styleMessageTranslate}>{dialog.question_translated}</div>
            <div style={styleAnswer}>
                <div style={styledescriptor}>Try to use these words:</div>
                {dialog.avoid.map((word:string, index:number) => {
                    let wstyle = {...styleAnswerToken}
                    if (selectedWord[index]) {
                        wstyle.background = '#990000'
                    }
                    return <span key={word} style={wstyle}>{word}</span>
                })}
            </div>
        </div>
    </div>)
}

export default React.memo(VideoPrompter)
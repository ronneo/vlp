import React, { useState, useEffect } from 'react';   
import { CSSTransition } from 'react-transition-group' 
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
        margin:'10px',
        position: 'absolute' as 'absolute',
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
    const keyPressActivity = (e:React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.keyCode === 39) {
            nextActivity()
        }
    }
    const showMessage = (index:number) => {
        if (index === activityCount) return true
        return false
    }
    useEffect(() => {
        let initialArr:Array<boolean> = Array.from(props.meetingActivity[activityCount].avoid, x=>false)
        console.log('new activity', initialArr, props.meetingActivity[activityCount])
        setSelectedWord(initialArr)
    }, [activityCount, props.meetingActivity])

    useEffect(() => {
        if (props.ended) {
            speechAPI.stop()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.ended])

    startSpeechtoText()

    return (<div>
        <div className="message-container">
        {props.meetingActivity.map((dialog, index) => {
            return (<CSSTransition
                key={index}
                in={showMessage(index)}
                timeout={300}
                classNames="message"
                unmountOnExit
              ><div style={styleMessageBox}>
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
            </div></CSSTransition>)
        })}</div>
        <div>{(activityCount < props.meetingActivity.length-1)?<Button outlined={true} onKeyDown={keyPressActivity} style={styleRefresh} minimal={true} icon="refresh" text="Next Suggestion" onClick={nextActivity} />:null}</div>
    </div>)
}

export default React.memo(VideoPrompter)
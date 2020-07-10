import React, { useState } from 'react';    
import { Card, ButtonGroup, Icon, Button } from "@blueprintjs/core";

type Props = {
    feedback:any,
    onSubmit:() => void,
    attendee?:{}
}

const VideoFeedback = (props:Props) => {
    const [userRating, setUserRating] = useState(0)
    const [loading, setLoading] = useState(false)

    const submitFeedback = () => {
        setLoading(true)
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ attendee:props.attendee, feedback:props.feedback, rating:userRating })
        }
        
        fetch('/users/feedback/', requestOptions)
		.then(response => response.json())
		.then(data => {
            setLoading(false)
			props.onSubmit()
		});
    }

    return (<Card className="videofeedback">
        <div>
            <pre>
                Debug: <br />
                Total Count: {props.feedback.videoResults.count} <br />
                Positive: {props.feedback.videoResults.positive} <br />
                Negative: {props.feedback.videoResults.negative} <br />
                Happy: {props.feedback.videoResults.happy} <br />
            </pre>
            <h3>How do you find this chat?</h3>
            <ButtonGroup>
                {[1,2,3,4,5].map((index)=>{
                    return <Icon key={index} className="staricon" iconSize={Icon.SIZE_LARGE} icon={userRating >= index?'star':'star-empty'} onClick={()=>setUserRating(index)} />
                })}
            </ButtonGroup>
        </div>
        <Button onClick={submitFeedback} rightIcon="arrow-right" loading={loading} text="Submit" />
    </Card>)
}

export default VideoFeedback
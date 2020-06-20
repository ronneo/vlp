import React, { useEffect, useState } from 'react';    
import { Card, InputGroup, ButtonGroup, Button } from "@blueprintjs/core";

type Props = {
    updateAttribute:(x: any) => void
}

const ChatSettings = (props:Props) => {
    const [displayName, setDisplayName] = useState('')
    const [chatType, setChatType] = useState('learn')
    const [language, setLanguage] = useState('en')
    const [chatLevel, setChatLevel] = useState(0)

    useEffect(() => {
        props.updateAttribute({
            'displayName': displayName,
            'chatType': chatType,
            'language': language,
            'chatLeve': chatLevel
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayName])

    return (<Card className="chatsetting">
        <div className="chatsettingrow">
            <InputGroup large={true} leftIcon="user" 
            onChange={(evt:any) => setDisplayName(evt.target.value)} 
            placeholder="What's your name?"
            value={displayName} />
        </div>
        <div className="chatsettingrow">
            <span>I'm looking to: </span>
            <ButtonGroup>
                <Button active={chatType === 'learn'} onClick={()=>setChatType('learn')}>Learn</Button>
                <Button active={chatType === 'guide'} onClick={()=>setChatType('guide')}>Guide</Button>
            </ButtonGroup>
        </div>
        <div className="chatsettingrow">
            <span>Language Selection: </span>
            <ButtonGroup>
                <Button active={language === 'en'} onClick={()=>setLanguage('en')}>English</Button>
                <Button active={language === 'cn'} onClick={()=>setLanguage('cn')}>Mandarin</Button>
                <Button active={language === 'id'} onClick={()=>setLanguage('id')}>Bahasa Indonesia</Button>
            </ButtonGroup>
        </div>
        <div className="chatsettingrow">
            <span>Proficiency Level: </span>
            <ButtonGroup>
                <Button active={chatLevel === 0} onClick={()=>setChatLevel(0)}>Beginner</Button>
                <Button active={chatLevel === 1} onClick={()=>setChatLevel(1)}>Intermediate</Button>
                <Button active={chatLevel === 2} onClick={()=>setChatLevel(2)}>Advanced</Button>
                <Button active={chatLevel === 3} onClick={()=>setChatLevel(3)}>Expert</Button>
            </ButtonGroup>
        </div>
    </Card>)
}

export default ChatSettings
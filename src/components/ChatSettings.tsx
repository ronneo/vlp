import React, { useEffect, useState } from 'react';    
import { Card, InputGroup, ButtonGroup, Button, HTMLSelect } from "@blueprintjs/core";

type Props = {
    updateAttribute:(x: any) => void
}

const ChatSettings = (props:Props) => {
    //style
    const styleChatSetting = {
        margin: '0 0 20px 0'
    }
    const styleChatRow = {
        margin:'0 0 15px 0',
        textAlign: 'center' as const
    }
    const styleChatRowButton = {
        outline:'none'
    }
    const styleChatRowSpan = {
        display:'inline-block',
        verticalAlign:'text-bottom',
        margin:'0 1em .15em 0'
    }
    const styleChatType = {
        textAlign: 'center' as const,
        borderTop: '1px solid #666',
        backgroundColor: '#222',
        margin: '20px 0 0 0',
        padding: '2em 0 2em 0'
    }
    const styleChatDrop = {
        margin:'0 .3em'
    }

    //Fix variables
    const languageText = [
        {value:'en', label:'English'},
        {value:'cn', label:'Mandarin'},
        {value:'id', label:'Bahasa'},
        {value:'hi', label:'Hindi'}
    ]
    const languageLevel = [
        {value:'1', label:'Beginner'},
        {value:'2', label:'Intermediate'},
        {value:'3', label:'Advanced'},
        {value:'4', label:'Expert'}
    ]

    const [displayName, setDisplayName] = useState('')
    const [chatType, setChatType] = useState('learn')
    const [language, setLanguage] = useState('en')
    const [speaker, setSpeaker] = useState<Array<string>>(['en'])
    const [chatLevel, setChatLevel] = useState('3')

    const toggleSpeaker = (chkLanuage:string) => {
        const searchIndex = speaker.indexOf(chkLanuage)
        if (searchIndex === -1) {
            setSpeaker([...speaker, chkLanuage])
        } else {
            let dupSpeaker = speaker.slice(0)
            dupSpeaker.splice(searchIndex, 1)
            setSpeaker(dupSpeaker)
        }
    }

    const languageSelection = (<span style={styleChatDrop}>
        <HTMLSelect onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => setLanguage(evt.target.value)}
            options={languageText} value={language}
            />
    </span>)

    const proficiencyLevel = (<span style={styleChatDrop}>
        at <HTMLSelect onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => setChatLevel(evt.target.value)}
            options={languageLevel} value={chatLevel}
            /> level
    </span>)

    const expertSelection = (<div style={styleChatRow}>
        <span style={styleChatRowSpan}>I can speak </span>
        <ButtonGroup>
            {languageText.map((lang) => {
                return ( <Button style={styleChatRowButton} 
                    key={lang.value}
                    icon={speaker.includes(lang.value)?'tick-circle':'circle'}
                    active={speaker.includes(lang.value)} 
                    onClick={()=>toggleSpeaker(lang.value)}>
                        {lang.label}
                    </Button>
                )
            })}
        </ButtonGroup>
    </div>
    )

    useEffect(() => {
        props.updateAttribute({
            'displayName': displayName,
            'chatType': chatType,
            'language': language,
            'chatLevel': chatLevel
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayName, chatType, language, chatLevel])

    return (<Card style={styleChatSetting}>
        <div style={styleChatRow}>
            <InputGroup large={true} leftIcon="user" 
            onChange={(evt:any) => setDisplayName(evt.target.value)} 
            placeholder="What's your name?"
            value={displayName} />
        </div>
        {expertSelection}
        <div style={styleChatType}>
            <span>I'm looking to </span>
            <HTMLSelect onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => setChatType(evt.target.value)} 
                options={[
                    {value:"learn", label:"Learn"},
                    {value:"guide", label:"Guide"}
                ]}
                value={chatType}
            />
            {(chatType==='learn')?languageSelection:null} 
            {(chatType==='learn' && language!=='')?proficiencyLevel:null}
        </div>
    </Card>)
}

export default ChatSettings
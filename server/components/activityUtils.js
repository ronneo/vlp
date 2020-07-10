const createActivity = ((settings) => {
    if (settings === undefined) return null

    //logic for all the black box magic happens here

    //dummy logic for demo
    if (settings.chatType === 'learn') {
        return [{
            'question':'Find out your guide\'s name',
            'question_translated':'找出对方的名称',
            'avoid':['name', 'what', 'call']
        },{
            'question':'Learn more about his work',
            'question_translated':'找出对方的职业',
            'avoid':['occupation', 'job', 'what']
        },{
            'question':'Find out how long has the other party been working',
            'question_translated':'找出对方工作了多长久',
            'avoid':['long', 'working', 'what']
        }]
    }
    
    return []
})

module.exports = {
    createActivity
}
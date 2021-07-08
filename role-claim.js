const firstMessage = require("./first-message")

module.exports = client => {
    const channelId = '852279654782074910'

    const getEmoji = emojiName => client.emojis.cache.find(emoji => emoji.name === emojiName)

    const emojis = {
        javascript: '✨',
        python: '🔥'
    }
    const roles = {
        javascript: 'JavaScript',
        python: 'Python'
    }

    const reactions = []
    let emojiText = 'Add a reaction to claim a role\n\n'
    for(const key in emojis){
        //const emoji = getEmoji(key)
        const emoji = emojis[key]
        reactions.push(emoji)

        const role = roles[key]
        emojiText += `${emoji} = ${role}\n`
    }
    firstMessage(client, channelId, emojiText, reactions)

    const handleReaction = (reaction, user, add) =>{
        if (user.id === '852010356862877717') {
            return
        }
        
        const emoji = reaction._emoji.name

        const {guild } = reaction.message

        const roleName = emojis[emoji]
        if(!roleName){
            return
        }

        const role = guil.roles.cache.find(role => role.name == roleName)
        const member =  guild.members.cache.find(member => member.id === user.id)

        if(add){
            member.role.add(role)
        }else{
            member.role.remove(rol)
        }
    }

    client.on('messageReactionAdd', (reaction, user) => {
        if(reaction.message.channel.id === channelId){
            handleReaction(reaction, user, true)
        }
    })

    client.on('messageReactionRemove', (reaction, user) => {
        if(reaction.message.channel.id === channelId){
            handleReaction(reaction, user, false)
        }
    })
}
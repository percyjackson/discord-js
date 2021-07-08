
const command = require("./command")
const mongo = require("./mongo")
const welcomeSchema = require("./schemas/welcome-schema")

module.exports=(client) => {
    //-setwelcome <message>
    const cache = {}//guildId: [channelId, text]

    command(client, 'setwelcome', async message => {
        const { member, content, channel, guild } = message

        if(!member.hasPermission('ADMINISTRATOR')){
            channel.send('You do not have permissions to run this command')
            return
        }

        let text = content
        //-setwelcome hello world => [-setwelcome, hello, world]
        const split = text.split(' ')

        if(split.length < 2){
            channel.send('Please provide a welcome message')
            return
        }

        split.shift()
        text = split.join(' ')

        cache[guild.id] = [channel.id, text]

        await mongo().then(async mongoose => {
            try {
                await welcomeSchema.findOneAndUpdate({
                    _id: guild.id
                }, {
                    //save docuemnt                
                    _id: guild.id,
                    channelId: channel.id,
                    text //text: text                
                }, {
                    upsert: true
                })
            } catch (e) {
                console.log(e)
            }finally{
                mongoose.connection.close()
            }
        })
    })

    const onJoin = async member => {
        const { guild } = member

        let data = cache[guild.id]

        if(!data){
            console.log('------------FETCHING FROM DATABASE---------------')
            await mongo().then(async mongoose => {
                try {
                    const result = await welcomeSchema.findOne({_id: guild.id})

                    cache[guild.id] = data = [result.channelId, result.text]
                } catch (e) {
                    console.log(e)
                } finally {
                    mongoose.connection.close()
                }
            })
        }
        const channelId = data[0]
        const text = data[1]

        const channel = guild.channels.cache.get(channelId)
        channel.send(text.replace(/<@>/g, `<@${member.id}>`))
    }

    command(client, 'simjoin', message => {
        onJoin(message.member)
    })

    client.on('guildMemberAdd', member => {
        onJoin(member)
    })
}


/*
module.exports = client => {
    const channelId = '852966271074828328'
    const targetChannelId = '852974159172075552'
    client.on('guildMemberAdd', (member) => {
        //console.log(member)

        const message = `Please welcome <@${member.id}> to the server! Please check out 
        ${member.guild.channels.cache.get(targetChannelId).toString()}`

        const channel = member.guild.channels.cache.get(channelId)

        channel.send(message)
    })
}
*/
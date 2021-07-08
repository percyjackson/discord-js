const command = require("./command")
const redis = require("./redis")

module.exports =  client => {
    const redisKeyPrefix = 'muted-'
    const giveRole = member => {
        const role = member.guild.roles.cache.find(role => role.name === 'Muted')
        if(role){
            member.roles.add(role)
            console.log('Muted '+ member.id)
        }
    }
    const onJoin = async member => {
        const { id } = member
        const redisClient = await redis()

        try {
            console.log(`${redisKeyPrefix}${id}`)
            redisClient.get(`${redisKeyPrefix}${id}`, (err, result) => {
                if(err) {
                    console.error('Redis GET error: ', err)
                }else if(result){
                    //'true'
                    giveRole(member)
                } else {
                    console.log('The user is not muted')
                }
            })
        } catch (e) {
            console.log(e)
        } finally {
            redisClient.quit()
        }
    }

    client.on('guildMemberAdd', member => {
        onJoin(member)
    })

    command(client, 'simjoin', message => {
        onJoin(message.member)
    })

    command(client, 'mute', async message => {
        //-mute @perso duration duration_type

        const syntax = '-mute <@> <duration as a number> <m, h, d, or life>'
        const {member, channel, content, mentions, guild} = message
        
        if (!member.hasPermission('ADMINISTRATOR')) {
            channel.send('You do not have permission to run this command.')
            return
        }

        const split = content.trim().split(' ')
        console.log('Split ', split)
        if (split.length !== 4) {
            channel.send('Please use the correct command syntax: ' + syntax)
            return
        }

        const duration = split[2]
        const durationType = split[3]

        if(isNaN(duration)){
            channel.send('Please provide a number for the duration. ' + syntax)
            return
        }

        const durations = {
            m: 60,
            h: 60 * 60,
            d: 60 * 60 * 24,
            life: -1
        }

        if(!durations[durationType]){
            channel.send('Please provide a valid duration type ' + syntax)
            return
        }

        const seconds = duration * durations[durationType]
        const target = mentions.users.first()
        if(!target){
            channel.send('Pleae tag a user to mute. ')
            return
        }
        
        const {id} = target

        const targetMember = guild.members.cache.get(id)

        giveRole(targetMember)

        const redisClient = await redis()
        try {
            const redisKey = `${redisKeyPrefix}${id}`

            if (seconds < 0) {
                redisClient.set(redisKey, 'true')
            }else{
                redisClient.set(redisKey, 'true', 'EX', seconds)
            }
           
        } catch (e) {
            console.log(e)
        }finally {
            redisClient.quit()
        }
    })
}
const path = require('path')
const fs = require('fs')
require('dotenv').config()
const Discord = require('discord.js')
const client  = new Discord.Client()

const config = require('./config.json')
const command = require('./command')
const firstMessage = require('./first-message')
const privateMessage = require('./private-message')
const roleClaim = require('./role-claim')
const poll = require('./poll')
const welcome = require('./welcome')
const sendMessage = require('./send-message')
const mongo = require('./mongo')
const messageCounter = require('./message-counter')
const mute = require('./mute')


client.on('ready', async () =>{
    console.log('The client is ready!')

    //firstMessage(client, '852011247556755477', 'Hello World!!!', ['💥','😃'])
    //privateMessage(client, 'ping', 'pong!')
    /*
    client.users.fetch('697275096791908393').then((user) => {
        user.send('Hello World!')
    })
    */

    const baseFile = 'command-base.js'
    const commandBase = require(`./commands/${baseFile}`)

    const readCommands = dir => {
        const files = fs.readdirSync(path.join(__dirname, dir))
        for(const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, dir, file))
            if (stat.isDirectory()) {
                readCommands(path.join(dir, file))
            } else if(file !== baseFile){
                const option = require(path.join(__dirname, dir, file))
                //console.log(file, option)
                commandBase(option)
            }
        }
    }

    readCommands('commands')

    commandBase.listen(client);

    await mongo().then(mongoose => {
        try {
            console.log('connected to Mongo')
        } catch (e) {
            console.log(e)
        }finally {
            mongoose.connection.close()
        }
    })
    const guild = client.guilds.cache.get('852010673265573898')
    const channel = guild.channels.cache.get('852011247556755477')

    //sendMessage(channel, "this is a permanent message", -1)// -1 para hacerlo permanente
    //sendMessage(channel, "this is a temporary message", 5) //cantidad de segundos, por defecto son 10 si se omite el parámetro
    mute(client)
    //welcome(client)
    messageCounter(client)
    //poll(client)

    //roleClaim(client) //organizar

    command(client, 'help', (message) => {
        message.channel.send(`
        **-help** - Displays the help menu
        **-add <num1> <num2>** - Adds two numbers
        **-sub <num1> <num2>** - Subtracts two numbers
        `)        
    })

    command(client, 'ban', message => {
        const {member, mentions} = message
        const tag = `<@${member.id}>`

        if (member.hasPermission('ADMINISTRATOR') || member.hasPermission('BAN_MEMBERS')){
            const target = mentions.users.first()
            if(target){
                const targetMember = message.guild.members.cache.get(target.id)
                targetMember.ban()
                message.channel.send(`${tag} That user has been banned.`)
            }else{
                message.channel.send(`${tag} Please specify someone to ban`)    
            }
        }else{
            message.channel.send(`${tag}  You do not have permission to use this command.`)
        }
        
    })

    command(client, 'kick', message => {
        const {member, mentions} = message
        const tag = `<@${member.id}>`

        if (member.hasPermission('ADMINISTRATOR') || member.hasPermission('KICK_MEMBERS')){
            const target = mentions.users.first()
            if(target){
                const targetMember = message.guild.members.cache.get(target.id)
                targetMember.ban()
                message.channel.send(`${tag} That user has been kicked.`)
            }else{
                message.channel.send(`${tag} Please specify someone to kick`)    
            }
        }else{
            message.channel.send(`${tag}  You do not have permission to use this command.`)
        }
        
    })

    const {prefix} = config
    client.user.setPresence({
        activity: {
            name: `Use ${prefix}help`
        }
    })
    /*
    command(client, 'serverinfo', (message) => {
        const {guild } = message
        //console.log(guild)
        const {name, region, memberCount, owner, afkTimeout} = guild 
        const icon = guild.iconURL()
        
        const embed = new Discord.MessageEmbed()
            .setTitle(`Server info for "${name}"`)
            .setThumbnail(icon)
            .addFields(
                {
                    name: 'Region',
                    value: region,
                },
                {
                    name: 'Members',
                    value: memberCount,
                },
                {
                    name: 'Owner',
                    value: owner.user.tag,
                },
                {
                    name: 'AFK Timeout',
                    value: afkTimeout / 60,
                },
            )

        message.channel.send(embed)
    })

    command(client, 'embed', (message) => {
        //-embed
        console.log(message.author)
        const embed = new Discord.MessageEmbed()
        .setTitle('Example Text Embed')
        .setURL ('https://www.youtube.com/watch?v=C22dH_ZUj-Q&list=PLaxxQQak6D_fxb9_-YsmRwxfw5PH9xALe&index=11')
        .setAuthor(message.author.username)
        .setFooter('This is a footer')
        .setColor('#00AAFF')
        .addFields(
            {
                name: 'Field 1',
                value: 'Hello 1',
                inline: true
            },
            {
                name: 'Field 2',
                value: 'Hello 2',
                inline: true
            },
            {
                name: 'Field 3',
                value: 'Hello 3',
                inline: true
            },
            {
                name: 'Field 4',
                value: 'Hello 4',            
            },            
        )
        message.channel.send(embed)
    })
   
    command(client, 'createtextchannel', (message)=> {
        const name = message.content.replace('-createtextchannel ','')
        message.guild.channels.create(name, {
            type: 'text',
        })
        .then((channel) =>{
            console.log(channel)
            const categoryId = '852204109385040002'
            channel.setParent(categoryId)
        })
    })

    command(client, 'createvoicechannel', (message) => {
        const name = message.content.replace('-createvoicechannel ','')
        message.guild.channels.create(name, {
            type: 'voice',
        }).then ((channel) => {
            const categoryId = '852204109385040002'
            channel.setParent(categoryId)
            channel.setUserLimit(10)
        })
    })
    ///reponder con pong cuando envían el comando -ping
    command(client, ['ping', 'test'], message => {
        message.channel.send('pong')
    })

    /// cuántos miembros hay en el servidor
    command(client, 'servers', (message) => {
        client.guilds.cache.forEach((guild) => {
            message.channel.send(`${guild.name} has a total of ${guild.memberCount} members`)
        })
    })
    */
    ///Borrar todos los mensajes en el canal si la personas tiene permisos de administrador
    command(client, ['cc', 'clearchannel'], message => {
        if(message.member.hasPermission('ADMINISTRATOR')){
            message.channel.messages.fetch().then((results) => {
                message.channel.bulkDelete(results)
            })
        }
    })

    //Actualizar e estado del bot
    command(client, 'status', message => {
        const content = message.content.replace('!status ', '');

        client.user.setPresence({
            activity: {
                name: content,
                type: 0,
            }
        })
    })
})
client.login(process.env.BOT_TOKEN)
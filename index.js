const Discord = require('discord.js'), client = new Discord.Client(), Enmap = require("enmap"), fs = require('fs');
const config = require('./config.json'), secret = require('./secret.json').token, { server, call, poll } = require('./db.js')
const spam = new Map
poll.deleteAll();
client.commands = new Discord.Collection()
client.call = new Enmap({ name: "call", autoFetch: true, fetchAll: false})
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log('READY TO CHEW.');  
  setInterval(() =>{
    server.set('statusMsgIndex', server.get('statusMsgIndex') + 1)
    if (server.get('statusMsgIndex') >= config.status.length) server.set('statusMsgIndex', 0)
    var o = server.get('statusMsgIndex')
    client.user.setPresence({
      status: 'online',
      activity: {
        name: config.status[o].name,
        type: config.status[o].type,
        URL: config.status[o].url
      }
    })
  }, config.statusTime * 1000)
});
client.on('message', msg => {
  if (!msg.guild) return
  if (!server.has(msg.guild.id)) {
    console.log('Initiating Server Profile creation.')
    call.set(msg.guild.id, {})
    server.set(msg.guild.id, { "prefix" : "!", "words" : [] })
    console.log('Server Profile Created.')
  }
  var k = server.get(msg.guild.id).words
  /*for(var i=0;i<k.length;i++){
    if(msg.content.includes(k[i].name)){
      k[i].board
    }
  }*/
  if (msg.author.bot) return
  if (!msg.content.startsWith(server.get(msg.guild.id).prefix)) return
  const args = msg.content.slice(server.get(msg.guild.id).prefix.length).trim().split(/\s+/g);
  const command = args.shift()
  if (!client.commands.has(command)){
    if (call.has(`${msg.guild.id}:${command}`)) {
      try{
        const package = call.get(`${msg.guild.id}:${command}`)
        switch (package.shift()) {
          case 'EMBED':
            for (var x = 0; x < package.length; x++) {
              var embed = new Discord.MessageEmbed;
              for (var o = 0; o < Object.keys(package[x]).length; o++) {
                if (Object.keys(package[x])[o] == 'title' || Object.keys(package[x])[o] == 'description' || Object.keys(package[x])[o] == 'url' || Object.keys(package[x])[o] == 'color') {
                  embed[Object.keys(package[x])[o]] = package[x][Object.keys(package[x])[o]][0]
                } else {
                  embed[Object.keys(package[x])[o]] = package[x][Object.keys(package[x])[o]]
                }
              }
              msg.channel.send(embed)
            }
            break;
          case 'ATTACH':
            const b = new Discord.MessageAttachment(package[0])
            msg.channel.send(b)
          break;
          case 'TEXT':
            msg.channel.send(package[0])
          break;
          }
      }catch(e){
        return msg.channel.send(`There's been an error : ${e}`)
      }
    } else {
      return msg.channel.send('Invalid Command! Try help');
    }
  }else{
    try {
      client.commands.get(command.toLowerCase()).execute(msg, args);
    } catch (e) {
      console.error(e);
      return msg.channel.send(`There's been an error : ${e}`);
    }
  }
  if (spam.get(`${msg.guild.id}${msg.member.user.id}`)) {
    var x = spam.get(`${msg.guild.id}${msg.member.user.id}`)
    if (x['cooldown']) {
      var t = Date.now() - x['cooldown']
      if (Math.floor(t / 1000) < config.spamtimeout) {
        x['penalty']++
        if (x['penalty'] <= 2) {
          return msg.channel.send(`Woah stop spamming, I can't run that fast! Gimme about ${config.spamtimeout - Math.floor(t / 1000)}s`)
        } else if (x['penalty'] >= 3) {
          msg.delete();
          return msg.author.send(config.penaltyMSGs[x['penalty'] - 3])
        }
      } else {
        delete x['cooldown']
      }
    } else {
      x['cooldown'] = Date.now()
    }
  }
  if (!msg.member.hasPermission('ADMINISTRATOR')) {
    spam.set(`${msg.guild.id}${msg.member.user.id}`, { 'cooldown': Date.now(), 'penalty': 0 })
  }
});
client.on("messageReactionAdd", (reaction, user) => {
  if (poll.get(reaction.message.id)) {
    var x = poll.get(reaction.message.id)
    if (reaction._emoji.name == 'tbdown') {
      x[reaction._emoji.name].push(user.id)
      if (x.tbup.includes(user.id)) {
        x.tbup.splice(x.tbup.indexOf(user.id, 1))
        reaction.message.reactions.resolve('740636494078672996').users.remove(user.id)
      }
    } else if (reaction._emoji.name == 'tbup') {
      x[reaction._emoji.name].push(user.id)
      if (x.tbdown.includes(user.id)) {
        x.tbdown.splice(x.tbdown.indexOf(user.id), 1)
        reaction.message.reactions.resolve('740636502257696838').users.remove(user.id)
      }
    }
    poll.set(reaction.message.id, x)
  }
})
client.on('guildCreate', guild => {
  //updated to enmap
  if (!server.has(guild.id)) {
    console.log('Initiating Server Profile creation.')
    call.set(msg.guild.id, {})
    server.set(guild.id, { "prefix": "!" })
    console.log('Server Profile Created.')
  }
})
client.on('guildDelete', guild => {
  server.delete(guild.id)
  console.log('Server Profile Deleted.')
})

client.login(secret);
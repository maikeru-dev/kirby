const Discord = require('discord.js');
const client = new Discord.Client();
const Enmap = require("enmap");
const config = require('./config.json'), secret = require('./secret.json')
const server = new Enmap({name: "server", autoFetch: true, fetchAll: false});
const embeds = new Enmap({name: "embeds", autoFetch: true, fetchAll: false});
const spam = new Map;
const poll = new Map;
const urlRegEx = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi)
client.once('ready', () => {
  console.log('READY TO CHEW.');
  function hourly(){
    server.set('statusMsgIndex',server.get('statusMsgIndex')+1)
    if(server.get('statusMsgIndex') >= config.status.length){
      server.set('statusMsgIndex', 0)
    }
    var o = server.get('statusMsgIndex')
    client.user.setPresence({
      status: 'online',
      activity: {
          name: config.status[o].name,
          type: config.status[o].type,
          URL: config.status[o].url
      }
  })
  setInterval(hourly,config.statusTime*1000)
  }
  hourly();
  
});
client.on('message', msg =>{
  if(!msg.guild) return
  if(!server.has(msg.guild.id)){
    console.log('Initiating Server Profile creation.')
    embeds.set(msg.guild.id, {})
    server.set(msg.guild.id, {"prefix":"!"})
    console.log('Server Profile Created.')
  }
if(msg.author.bot) return
if(!msg.content.startsWith(server.get(msg.guild.id).prefix)) return
 const args = msg.content.slice(server.get(msg.guild.id).prefix.length).trim().split(/\s+/g);
 const command = args.shift()
 if(spam.get(`${msg.guild.id}${msg.member.user.id}`)){
  var x = spam.get(`${msg.guild.id}${msg.member.user.id}`)
  if(x['cooldown']){
    var t = Date.now() - x['cooldown']
    if(Math.floor(t / 1000) < config.spamtimeout){
      x['penalty']++
      if(x['penalty'] <= 2){
        return msg.channel.send(`Woah, stop spamming, I can't run that fast! Gimme about ${config.spamtimeout - Math.floor(t / 1000)}s`)
      }else if(x['penalty'] >= 3){
        msg.delete();
        return msg.author.send(config.penaltyMSGs[x['penalty']-3])
      }
    }else{
      delete x['cooldown']
    }
  }else{
    x['cooldown'] = Date.now()
  }
}
if(!msg.member.hasPermission('ADMINISTRATOR')){
  spam.set(`${msg.guild.id}${msg.member.user.id}`,{'cooldown':Date.now(),'penalty':0})
}
switch(command.toLowerCase()) {
    case 'ping':
      msg.channel.send('Pinging...').then(m => {
       m.edit(`Pong!\nAPI Latency: ${Math.round(client.ws.ping)}ms  User Ping: ${m.createdTimestamp - msg.createdTimestamp}ms`)
      })
    break;
    case 'prefix':
     if(msg.member.hasPermission('ADMINISTRATOR')){
       if(!args[0]) return msg.channel.send(`Current Prefix is '${server.get(msg.guild.id).prefix}'`)
       if(args[0].length > 1) return msg.channel.send('Warn: Prefix Argument is longer than 1 character.')
        var updateServ = server.get(msg.guild.id);
        updateServ.prefix = args[0].toLowerCase();
        server.set(msg.guild.id, updateServ)
        msg.channel.send(`Prefix set to ${args[0].toLowerCase()}`)
     }else {return msg.channel.send('Insufficient Permissions')}
    break;
    case 'create':
      try{if(msg.member.hasPermission('ADMINISTRATOR')){
        if(args.length <= 1) return msg.channel.send('Warn: Missing Arguments, must be greater than 2')
        if(args[0].length > 32) return msg.channel.send('Warn: Name Argument must be shorter than 32 characters')
        const name = args.shift();
        const data = args.join(' ');
        if(data.includes('easy')){
          return msg.channel.send(`'Easy' is not supported yet!`)
        }
        var package=[]
        var loc = [[0]];
        var field = []
        for(var i=0; i<data.length;i++){
          if(data[i] == '='){
            loc.push([i+1])
          }
        }
        var fCount = 0;
        for(var i=0; i<loc.length;i++) {
          if(!loc[i+1]){
            var v = data.substring(loc[i][0],data.length)
          }else{
            var v = data.substring(loc[i][0],loc[i+1][0])
          }
          for(var x=0; x<v.length;x++){
            if(v[x] == '+'){
              loc[i].push(x)
            }
            if(v[x] == 'f'){
              fCount++
            }
          }
          if(fCount > 25) return msg.channel.send('Warn: Field count is over 25 for Embed!')
          loc[i].shift();
          var e = new Object;
          for(var b=0;b<loc[i].length;b++){
            var n = v.substring(loc[i][b]+2,loc[i][b+1])
            switch(v[loc[i][b]+1]){
              case 't':
                if(n.length > 256) return msg.channel.send('Warn: Title is longer than 256 characters!')
                e.title = [n]
              break;
              case 'd':
                if(n.length > 2048) return msg.channel.send('Warn: Description is longer than 2048 characters!')
                e.description = [n]
              break;
              case 'c':
                if(/^#[0-9A-F]{6}$/i.test(n)){
                  e.color = [n]
                }else{
                  return msg.channel.send(`Warn: Invalid Hex Color here: ${n}`)
                }
              break;
              case 'f':
                if(v[loc[i][b+1]+1] == '<'){
                  var fv = v.substring(loc[i][b+1]+2,loc[i][b+2])
                }else{
                  return msg.channel.send(`Warn: Missing Value, expression after ${v.substring(loc[i][b+0],loc[i][b+1])} must be '+<'!`)
                }
                if(v[loc[i][b+2]+1] == '>'){
                  var sv = v.substring(loc[i][b+2]+2,loc[i][b+3])
                  if(sv == 'true'){
                }else{
                  var sv = 'false'
                }
              }
                field.push({name:n,value:fv,inline:sv})
              break;
              case 'b':
                if(v[loc[i][b+1]+1] == '<'){
                  if(urlRegEx.match(v.substring(loc[i][b+1]+2,loc[i][b+2]))){
                    var fv = v.substring(loc[i][b+1]+2,loc[i][b+2])
                  }else return msg.channel.send(`Warn: Invalid Url here: ${v.substring(loc[i][b+1],loc[i][b+2])}`)
                }else{
                  var fv = null
                }
                e.footer = {text:n,iconUrl:fv}
              break;
              case 'u':
                if(!urlRegEx.match(n)){return msg.channel.send(`Warn: Invalid Url here: ${v.substring(loc[i][b+0],loc[i][b+1])}`)}

                e.url = n
              break;
              case 'i':
                if(!urlRegEx.match(n)){return msg.channel.send(`Warn: Invalid Url here: ${v.substring(loc[i][b+0],loc[i][b+1])}`)}
                e.image = {url:n}
              break;
              case 'a':
                if(v[loc[i][b+1]+1] == '<'){
                  if(!urlRegEx.match(v.substring(loc[i][b+1]+2,loc[i][b+2]))){return msg.channel.send(`Warn: Invalid Url here: ${v.substring(loc[i][b+1],loc[i][b+2])}`)}
                var fv = v.substring(loc[i][b+1]+2,loc[i][b+2])
                }else {
                  var fv = null
                }
                if(v[loc[i][b+2]+1] == '>'){
                  if(!urlRegEx.match(v.substring(loc[i][b+2]+2,loc[i][b+3]))){return msg.channel.send(`Warn: Invalid Url here: ${v.substring(loc[i][b+2],loc[i][b+3])}`)}
                  var sv = v.substring(loc[i][b+2]+2,loc[i][b+3])
                }else{
                  var sv = null
                }
                e.author = {name:n,iconUrl:fv,url:sv}
              break;
            }
          }
            e.fields = field
            console.log(e)
          package.push(e)
        }
        embeds.set(`${msg.guild.id}:${name}`,package)
        }
      }catch(e){
        return msg.channel.send(`There's been an error: ${e}`)
      }
    break;
    case 'clearembed':
      if(msg.member.hasPermission('ADMINISTRATOR')){
        if(args.length > 0){
         if(embeds.has(args[0])){
          embeds.delete(args[0]);
          msg.channel.send(`Deleted Embed ${args[0]}!`)
         }else{
           msg.channel.send('This Embed does not exist!')
         }
        }else{
          msg.channel.send(`Deleted ${embeds.count} Embeds!`)
          embeds.deleteAll();
        }
      }
    break;
    case 'credits':
      var k = new Discord.MessageEmbed()
      k.addFields(
        { name: 'Programmer', value: 'Maik#4385, \nhttps://github.com/maikeru-dev/'},
        { name: 'Creative Man', value: '20mm#7632'})
      k.setTitle('Credits!')
      k.setColor('#5cd1ff')
      k.setImage('https://cdn.discordapp.com/attachments/718128806107283557/740319884444958830/20mm_head_bruh.png')
      msg.channel.send(k)
    break;
    case 'purge':
      if(msg.member.hasPermission('ADMINISTRATOR')){
        if(!args[0]) return msg.channel.send('Warn: Missing Argument')
        if(!parseInt(args[0],10)) return msg.channel.send('Warn: Invalid Argument, must be a number')
        if(args[0] < 1) return msg.channel.send('Warn: Invalid Argument, must be greater than 1')
        var count = args[0]
        try{
          while(count>1){
            if(count > 100){
              msg.channel.bulkDelete(100)
              count = count - 100
            }else{
              msg.channel.bulkDelete(count)
              count = 0
            } 
          }
        }catch(e){
          return msg.channel.send(`There's been an error! ${e}`)
        }
      return msg.channel.send(`Successfully deleted ${args[0]} msgs!`)
      }
    break;
    case 'poll':
      var k = new Discord.MessageEmbed;
      k.setDescription(args.join(' '))
      k.setColor('#2667ff')
      msg.channel.send(k).then((m)=>{
        m.react('740636494078672996').then(() => 
          m.react('740636502257696838')
        )
        setTimeout(() => {
          poll.set(m.id,{'tbup':[],'tbdown':[]})
        }, 2000);
      })
    break;
    default: 
      if(embeds.has(`${msg.guild.id}:${command}`)){
        const package = embeds.get(`${msg.guild.id}:${command}`)
        for(var x=0;x<package.length;x++){
           var embed = new Discord.MessageEmbed;
           for(var b=0;b<Object.keys(package[x]).length;b++){
             if(Object.keys(package[x])[b] == 'title' || Object.keys(package[x])[b] == 'description' || Object.keys(package[x])[b] == 'url' || Object.keys(package[x])[b] == 'color'){
              embed[Object.keys(package[x])[b]] = package[x][Object.keys(package[x])[b]][0]
             }else{
              embed[Object.keys(package[x])[b]] = package[x][Object.keys(package[x])[b]]
             }
           }
           msg.channel.send(embed)
        }
      }else{
        return msg.channel.send('Invalid Command! Try help');
      }
}
return
});
client.on("messageReactionAdd", (reaction,user) => {
  if(poll.get(reaction.message.id)){
    var x = poll.get(reaction.message.id)
    if(reaction._emoji.name == 'tbdown'){
      x[reaction._emoji.name].push(user.id)
      if(x.tbup.includes(user.id)){
        x.tbup.splice(x.tbup.indexOf(user.id,1))
        reaction.message.reactions.resolve('740636494078672996').users.remove(user.id)
      }
    }else if(reaction._emoji.name == 'tbup'){
      x[reaction._emoji.name].push(user.id)
      if(x.tbdown.includes(user.id)){
        x.tbdown.splice(x.tbdown.indexOf(user.id),1)
        reaction.message.reactions.resolve('740636502257696838').users.remove(user.id)
      }
    }
    poll.set(reaction.message.id,x)
  }
})
client.on('guildCreate', guild => {
 //updated to enmap
 if(!server.has(guild.id)){
  console.log('Initiating Server Profile creation.')
  embeds.set(msg.guild.id, {})
  server.set(guild.id, {"prefix":"!"})
  console.log('Server Profile Created.')
}
})
client.on('guildDelete', guild => {
  server.delete(guild.id)
  console.log('Server Profile Deleted.')
})

client.login(secret.token);
const Discord = require('discord.js');
const client = new Discord.Client();
const Enmap = require("enmap");
const config = require('./config.json')
const server = new Enmap({name: "server", autoFetch: true, fetchAll: false});
const embeds = new Enmap({name: "embeds", autoFetch: true, fetchAll: false});
const spam = new Map;
const poll = new Map;
const urlRegEx = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi)
client.once('ready', () => {
  console.log('READY TO CHEW.');
  
});
client.on('message', msg =>{
  if(!server.has(msg.guild.id)){
    console.log('Initiating Server Profile creation.')
    embeds.set(msg.guild.id, {})
    server.set(msg.guild.id, {"prefix":"!"})
    console.log('Server Profile Created.')
  }
if(msg.author.bot)
 return
if(!msg.content.startsWith(server.get(msg.guild.id).prefix))
 return
 const args = msg.content.slice(server.get(msg.guild.id).prefix.length).trim().split(/\s+/g);
 const command = args.shift()
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
        // +f means field   +t means title   +c means colour   +< means value   +d means description   +u means url   +a means author
        // +i means image   +b means footer   +> means second value  += means next embed
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
      if(spam.get(msg.member.id)){
        var x = spam.get(msg.member.id)
        if(x['poll']){
          var t = (Date.now() - x['poll'])
          if(t < 60){
            return msg.channel.send(`You cannot poll for another ${60 - t}s`)
          }else{
            delete x['poll']
          }
        }else{
          x['poll'] = Date.now()
        }
      }
      if(!msg.member.hasPermission('ADMINISTRATOR')){
        spam.set(msg.member.id,{'poll':Date.now()})
      }
      var k = new Discord.MessageEmbed;
      k.setDescription(args.join(' '))
      k.setColor('#2667ff')
      
    
      msg.channel.send(k).then((m)=>{
        
      })
      return poll.set(msg.id,{'up':[],'down':[]})
    break;
    default: 
      if(embeds.has(`${msg.guild.id}:${command}`)){
        if(spam.get(msg.member.id)){
          var x = spam.get(msg.member.id)
          if(x['embed']){
            var t = (Date.now() - x['embed'])
            if(t < 60){
              return msg.channel.send(`You cannot poll for another ${60 - t}s`)
            }else{
              delete x['embed']
            }
          }else{
            x['embed'] = Date.now()
          }
        }
        if(!msg.member.hasPermission('ADMINISTRATOR')){
          spam.set(msg.member.id,{'embed':Date.now()})
        }
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
  console.log(reaction.users.reaction)
  if(poll.get(reaction.message.id)){
    
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

client.login(config.token);
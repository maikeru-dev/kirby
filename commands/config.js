const { server, call, poll } = require('../db.js'), config = require('../config.json'), Discord = require('discord.js')
function checkRole(mention){
    if (!mention) return false;
    var role = mention
    if(role.match(/<@&(\d{17,19})>/g)){
     if (role.startsWith('<@') && role.endsWith('>')) {
         role = role.slice(2, -1);
         console.log(role) 
         if (role.startsWith('&')) {
             role = role.slice(1);
             console.log(role) 
             return role
         }
         
     }else {
        console.log(role) 
        return false}
    }
}
module.exports = {
    name: 'config',
    description: 'Config command, configure your server roles or else!',
    execute(msg, args) {
        if (msg.member.hasPermission('ADMINISTRATOR')) {
            switch (args.shift()) {
                case 'prefix':
                    if (!args[0]) return msg.channel.send(`Current Prefix is '${server.get(msg.guild.id).prefix}'`)
                    if (args[0].length > 2) return msg.channel.send('Warn: Prefix Argument is longer than 2 characters.')
                    var updateServ = server.get(msg.guild.id);
                    updateServ.prefix = args[0].toLowerCase();
                    server.set(msg.guild.id, updateServ)
                    msg.channel.send(`Prefix set to ${args[0].toLowerCase()}`)
                    break;
                case 'permission':
                    switch (args.shift()) {
                        case 'add':
                            if (server.get(msg.guild.id).permission.hasOwnProperty(args[0])) {
                                if (!checkRole(args[1])) return msg.channel.send('Warn: Cannot Resolve Role, make sure your Role Argument is valid!')
                                var updateServ = server.get(msg.guild.id);
                                updateServ.permission[args[0]].push(checkRole(args[1]))
                                server.set(msg.guild.id, updateServ)
                                msg.channel.send(updateServ.permission[args[0]])
                            } else return msg.channel.send('Warn: Invalid Config Property!')
                            break;
                        case 'remove':
                            if (server.get(msg.guild.id).permission.hasOwnProperty(args[0])) {
                                if (!checkRole(args[1])) return msg.channel.send('Warn: Cannot Resolve Role, make sure your Role Argument is valid!')
                                var updateServ = server.get(msg.guild.id);
                                const role = checkRole(args[1])
                                const index = updateServ.permission[args[0]].indexOf(role);
                                if (index > -1) {
                                    updateServ[args[0]].splice(index, 1);
                                } else return msg.channel.send('Warn: Invalid Role, This role does not exist in this property!')
                                server.set(msg.guild.id, updateServ)
                                msg.channel.send(updateServ.permission[args[0]])
                            } else msg.channel.send('Warn: Invalid Config Property!')
                            break;
                        case 'sync':
                            switch (args.shift()) {
                                case 'add':
                                    if (server.get(msg.guild.id).permission.hasOwnProperty(args[0])) {
                                        if (server.get(msg.guild.id).permission.hasOwnProperty(args[1])) {
                                            var updateServ = server.get(msg.guild.id)
                                            updateServ.permission[args[0]].concat(updateServ[args[1]])
                                            server.set(msg.guild.id, updateServ)
                                            msg.channel.send(updateServ.permission[args[0]])
                                            break;
                                        } msg.channel.send('Warn: Invalid Property in second argument, This property does not exist!')
                                    } else msg.channel.send('Warn: Invalid Property in first argument, This property does not exist!')
                                case 'set':
                                    if (server.get(msg.guild.id).permission.hasOwnProperty(args[0])) {
                                        if (server.get(msg.guild.id).permission.hasOwnProperty(args[1])) {
                                            var updateServ = server.get(msg.guild.id)
                                            updateServ.permission[args[0]] = updateServ[args[1]]
                                            server.set(msg.guild.id, updateServ)
                                            msg.channel.send(updateServ.permission[args[0]])
                                            break;
                                        } else msg.channel.send('Warn: Invalid Property in second argument, This property does not exist!')
                                    } else msg.channel.send('Warn: Invalid Property in first argument, This property does not exist!')
                                default:
                                    msg.channel.send('Warn: Invalid Third Parameter')
                            }
                            break;
                        case 'clear':
                            if (server.get(msg.guild.id).permission.hasOwnProperty(args[0])) return msg.channel.send('Warn: Invalid Property in first argument, This property does not exist!')
                            var updateServ = server.get(msg.guild.id)
                            updateServ.permission[args[0]] = []
                            server.set(msg.guild.id, updateServ)
                            msg.channel.send(updateServ.permission[args[0]])
                            break;
                        default:
                             msg.channel.send('Warn: Invalid Second Parameter')
                    }
                    break;
                default:
                     msg.channel.send('Warn: Invalid First Parameter')
            }
        } else { msg.channel.send('Warn: Missing Permissions') }
    },
    checkPerm(msg, perm){
        for(var i=0;i<msg.member._roles.length;i++){
            if(server.get(msg.guild.id).permission[perm].includes(msg.member._roles[i])){
                return true
            }
        }
        return false
    }
    
};
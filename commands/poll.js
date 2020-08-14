const { server, call, poll } = require('../db.js')
const Discord = require('discord.js')
module.exports = {
	name: 'poll',
	description: 'Poll command, creates a poll!',
	execute(msg, args) {
    var k = new Discord.MessageEmbed()
     k.setDescription(args.join(' '))
     k.setColor('#2667ff')
     msg.channel.send(k).then((m) => {
       m.react('740636494078672996').then(() =>
         m.react('740636502257696838')
       )
       setTimeout(() => {
         poll.set(m.id, { 'tbup': [], 'tbdown': [] })
       }, 2000);
     })
	},
};
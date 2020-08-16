const { server, call, poll } = require('../db.js')
const config = require('../config.json')
const Discord = require('discord.js')
const { checkPerm } = require('./config.js')
module.exports = {
	name: 'poll',
	description: 'Poll command, creates a poll!',
	execute(msg, args) {
    if(checkPerm(msg, 'poll')) {
    if(args.length < 2) return msg.channel.send('Warn: Argument count must be greater or equal to 2!')
    if(isNaN(parseInt(args[0]))) return msg.channel.send('Warn: Timeout argument is not a valid number!')
    var time = parseInt(args.shift(), 10)
    if(time > config.pollTimeout || time < 20) return msg.channel.send(`Warn: Timeout argument is greater than config allows or less than 20s, Maximum timeout: ${config.pollTimeout}s!`)
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
       setTimeout(() => {
         var p = poll.get(m.id)
         k.setDescription('```Vote is over! Winning vote is ' + `${p.tbup.length >= p.tbdown.length ? 'Agree' : 'Disagree'}! \nTotal Votes: ${p.tbdown.length + p.tbup.length}, Winning vote won by ${p.tbup.length >= p.tbdown.length ? p.tbup.length - p.tbdown.length : p.tbdown.length - p.tbup.length}` + '```')
         m.edit(k)
       }, time*1000);
     })
    }else msg.channel.send('Warn: Missing Permission')
    
	},
};
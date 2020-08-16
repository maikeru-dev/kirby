const { server, call, poll } = require('../db.js'), config = require('../config.json'), Discord = require('discord.js')
const { checkPerm } = require('./config.js')
module.exports = {
	name: 'echo',
	description: 'Echo command, echos whatever you tell it to!',
	execute(msg, args) {
	if (checkPerm(msg, 'echo')){ 
	if(msg.deletable){
		msg.delete().then(() => {
			msg.channel.send(args)
		  })
		}
	}else msg.channel.send('Warn: Missing Permission')
}
};
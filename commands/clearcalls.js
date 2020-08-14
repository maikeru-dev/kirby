const { server, call, poll } = require('../db.js')
module.exports = {
	name: 'clearcalls',
	description: 'Clear Calls Command, clears all or one calls!',
	execute(msg, args) {
		if (msg.member.hasPermission('ADMINISTRATOR')) {
            if (args.length > 0) {
              if (call.has(`${msg.guild.id}:${args[0]}`)) {
                call.delete(`${msg.guild.id}:${args[0]}`);
                msg.channel.send(`Deleted call ${args[0]}!`)
              } else {
                return msg.channel.send('This call does not exist!')
              }
            } else {
              msg.channel.send(`Deleted ${call.count} calls!`)
              call.deleteAll();
            }
          }else return
	},
};
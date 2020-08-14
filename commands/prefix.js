const { server, call, poll } = require('../db.js')
module.exports = {
	name: 'prefix',
	description: 'Prefix command, sets the prefix!',
	execute(msg, args) {
		if (msg.member.hasPermission('ADMINISTRATOR')) {
            if (!args[0]) return msg.channel.send(`Current Prefix is '${server.get(msg.guild.id).prefix}'`)
            if (args[0].length > 2) return msg.channel.send('Warn: Prefix Argument is longer than 2 characters.')
            var updateServ = server.get(msg.guild.id);
            updateServ.prefix = args[0].toLowerCase();
            server.set(msg.guild.id, updateServ)
            msg.channel.send(`Prefix set to ${args[0].toLowerCase()}`)
          } else return

	},
};
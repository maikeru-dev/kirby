module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(msg, args) {
		msg.channel.send('Pinging...').then(m => {
            m.edit(`Pong! User Ping: ${m.createdTimestamp - msg.createdTimestamp}ms`)
          })
	},
};
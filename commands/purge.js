const config = require('../config.json')
const { checkPerm } = require('./config.js')
module.exports = {
	name: 'purge',
	description: 'Purge command, purges the chat!',
	execute(msg, args) {
		if (checkPerm(msg, 'purge')) {
            if (!args[0]) return msg.channel.send('Warn: Missing Argument')
            if (!parseInt(args[0], 10)) return msg.channel.send('Warn: Invalid Argument, must be a number')
            if (args[0] < 1) return msg.channel.send('Warn: Invalid Argument, must be greater than 1')
            var count = args[0] > config.purgeLimit ? config.purgeLimit : args[0]
            try {
              while (count > 1) {
                if (count > 100) {
                  msg.channel.bulkDelete(100)
                  count = count - 100
                } else {
                  msg.channel.bulkDelete(count)
                  count = 0
                }
              }
            } catch (e) {
              return msg.channel.send(`There's been an error! ${e}`)
            }
            msg.channel.send(`Successfully deleted ${args[0]} msgs!`)
          }else msg.channel.send('Warn: Missing Permission')
	},
};
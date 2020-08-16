const Discord = require('discord.js')
module.exports = {
  name: 'credits',
  description: 'Credits Command, sends an embed with credits!',
  execute(msg, args) {
    var k = new Discord.MessageEmbed()
    k.addFields(
      { name: 'Programmer', value: 'Maik#4385, \nhttps://github.com/maikeru-dev/' },
      { name: 'Creative Man', value: '20mm#7632' })
    k.setTitle('Credits!')
    k.setColor('#5cd1ff')
    k.setImage('https://cdn.discordapp.com/attachments/718128806107283557/740319884444958830/20mm_head_bruh.png')
    msg.channel.send(k)
  },
};
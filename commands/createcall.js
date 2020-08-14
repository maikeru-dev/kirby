const { server, call, poll } = require('../db.js')
module.exports = {
	name: 'createcall',
	description: 'Create Call Command, creates a call!',
	execute(msg, args) {
		try {
            if (!msg.member.hasPermission('ADMINISTRATOR')) return
            if (args.length < 3) return msg.channel.send(`Warn: Argument Count must be greater or equal to 3`)
            const type = args.shift().toUpperCase()
            const name = args.shift()
            const urlRegEx = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi)
            if (type != 'ATTACH' && type != 'EMBED' && type != 'TEXT') return msg.channel.send(`Warn: Type (1st) Argument must equal 'attach', 'embed' or 'text'`)
            if (name.length > 32) return msg.channel.send('Warn: Name (2nd) Argument must be shorter than 32 characters')
            var package = []
            var data;
            package.push(type)
            switch (type.toUpperCase()) {
              case 'EMBED':
                var data = args.join(' ');
                var index = [[0]];
                var field = []
                for (var i = 0; i < data.length; i++) {
                  if (data[i] == '=') {
                    index.push([i + 1])
                  }
                }
                var fCount = 0;
                for (var i = 0; i < index.length; i++) {
                  if (!index[i + 1]) {
                    var v = data.substring(index[i][0], data.length)
                  } else {
                    var v = data.substring(index[i][0], index[i + 1][0])
                  }
                  for (var x = 0; x < v.length; x++) {
                    if (v[x] == '+') {
                      index[i].push(x)
                    }
                    if (v[x] == 'f') {
                      fCount++
                    }
                  }
                  if (fCount > 25) return msg.channel.send('Warn: Field count is over 25 for Embed!')
                  index[i].shift();
                  var e = new Object;
                  for (var b = 0; b < index[i].length; b++) {
                    var n = v.substring(index[i][b] + 2, index[i][b + 1])
                    switch (v[index[i][b] + 1]) {
                      case 't':
                        if (n.length > 256) return msg.channel.send('Warn: Title is longer than 256 characters!')
                        e.title = [n]
                        break;
                      case 'd':
                        if (n.length > 2048) return msg.channel.send('Warn: Description is longer than 2048 characters!')
                        e.description = [n]
                        break;
                      case 'c':
                        if (/^#[0-9A-F]{6}$/i.test(n)) {
                          e.color = [n]
                        } else {
                          return msg.channel.send(`Warn: Invalid Hex Color here: ${n}`)
                        }
                        break;
                      case 'f':
                        if (v[index[i][b + 1] + 1] == '<') {
                          var fv = v.substring(index[i][b + 1] + 2, index[i][b + 2])
                        } else {
                          return msg.channel.send(`Warn: Missing Value, expression after ${v.substring(index[i][b + 0], index[i][b + 1])} must be '+<'!`)
                        }
                        if (v[index[i][b + 2] + 1] == '>') {
                          var sv = v.substring(index[i][b + 2] + 2, index[i][b + 3])
                          if (sv == 'true') {
                          } else {
                            var sv = 'false'
                          }
                        }
                        field.push({ name: n, value: fv, inline: sv })
                        break;
                      case 'b':
                        if (v[index[i][b + 1] + 1] == '<') {
                          if (v.substring(index[i][b + 1] + 2, index[i][b + 2]).match(urlRegEx)) {
                            var fv = v.substring(index[i][b + 1] + 2, index[i][b + 2])
                          } else return msg.channel.send(`Warn: Invalid Url here: ${v.substring(index[i][b + 1], index[i][b + 2])}`)
                        } else {
                          var fv = null
                        }
                        e.footer = { text: n, iconUrl: fv }
                        break;
                      case 'u':
                        if (!n.match(urlRegEx)) return msg.channel.send(`Warn: Invalid Url here: ${v.substring(index[i][b + 0], index[i][b + 1])}`) 
                        e.url = n
                        break;
                      case 'i':
                        if (!n.match(urlRegEx)) return msg.channel.send(`Warn: Invalid Url here: ${v.substring(index[i][b + 0], index[i][b + 1])}`) 
                        e.image = { url: n }
                        break;
                      case 'a':
                        if (v[index[i][b + 1] + 1] == '<') {
                          if (!v.substring(index[i][b + 1] + 2, index[i][b + 2]).match(urlRegEx)) { return msg.channel.send(`Warn: Invalid Url here: ${v.substring(index[i][b + 1], index[i][b + 2])}`) }
                          var fv = v.substring(index[i][b + 1] + 2, index[i][b + 2])
                        } else {
                          var fv = null
                        }
                        if (v[index[i][b + 2] + 1] == '>') {
                          if (!v.substring(index[i][b + 2] + 2, index[i][b + 3]).match(urlRegEx)) { return msg.channel.send(`Warn: Invalid Url here: ${v.substring(index[i][b + 2], index[i][b + 3])}`) }
                          var sv = v.substring(index[i][b + 2] + 2, index[i][b + 3])
                        } else {
                          var sv = null
                        }
                        e.author = { name: n, iconUrl: fv, url: sv }
                        break;
                    }
                  }
                  e.fields = field
                  package.push(e)
                }
                break;
                case 'ATTACH':
                  var data = args.shift();
                  if(!data.match(urlRegEx)) return msg.channel.send(`Warn: Invalid URL: '${data}'`)
                  if(!data.match(/(https?:\/\/.*\.(?:png|jpg|mp4|mp3|mov|gif|txt|docx|webm|rar|zip))/i)) return msg.channel.send(`Warn: Invalid MEDIA URL: '<${data}>'`)
                  package.push(data)
                break;
                case 'TEXT':
                  var data = args.join(' ')
                  package.push(data)
                break;
            }
            call.set(`${msg.guild.id}:${name}`,package)
          } catch (e) {
            return msg.channel.send(`There's been an error: ${e}`)
          }
	},
};
const Enmap = require("enmap");

module.exports = {
  call: new Enmap({
    name: "call",
    autoFetch: true,
    fetchAll: false
  }),
  server: new Enmap({
    name: "server",
    autoFetch: true,
    fetchAll: false
  }),
  poll: new Enmap({
    name: "poll",
    autoFetch: true,
    fetchAll: false
  })
}
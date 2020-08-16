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
    fetchAll: true
  }),
  poll: new Map
}
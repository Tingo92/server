/**
 * Creates the socket server and returns the Server instance
 */
const http = require('http')
const socket = require('socket.io')
const redisAdapter = require('socket.io-redis')
const config = require('../../config')
const logger = require('../../logger')
const expressPino = require('express-pino-logger')

// Create an HTTPS server if in production, otherwise use HTTP.
const createServer = app => {
  return http.createServer(app)
}

module.exports = function(app) {
  const server = createServer(app)

  const port =
    process.env.NODE_ENV === 'test'
      ? 4000 + Number(process.env.JEST_WORKER_ID)
      : config.socketsPort

  server.listen(port)

  console.log('Sockets.io listening on port ' + port)

  const io = socket(server)
  if (process.env.NODE_ENV === 'test') return io

  const redisUrl = new URL(config.redisConnectionString)
  io.adapter(redisAdapter({ host: redisUrl.hostname, port: redisUrl.port }))

  // initiate logging on the socket connections following https://socket.io/docs/v2/namespaces/#Namespace-middleware
  const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
  const expressLogger = expressPino({ logger })
  io.use(wrap(expressLogger))

  return io
}

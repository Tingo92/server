/**
 * Creates the socket server and returns the Server instance
 */
import http from 'http'
import socketio from 'socket.io'
import redisAdapter from 'socket.io-redis'
import config from '../../config'
import logger from '../../logger'

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

  const io = socketio(server)
  if (process.env.NODE_ENV === 'test') return io

  const redisUrl = new URL(config.redisConnectionString)
  io.adapter(redisAdapter({ host: redisUrl.hostname, port: redisUrl.port }))

  // initiate logging on the socket connections following https://socket.io/docs/v2/namespaces/#Namespace-middleware
  io.use((socket, next) => {
    logger.info(socket.request)
    next()
  })

  return io
}

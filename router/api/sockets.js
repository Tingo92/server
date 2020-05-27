/**
 * Processes incoming socket messages
 */
const passportSocketIo = require('passport.socketio')
const cookieParser = require('cookie-parser')
const config = require('../../config')
const SessionCtrl = require('../../controllers/SessionCtrl.js')
const SessionService = require('../../services/SessionService.js')
const SocketService = require('../../services/SocketService.js')
const Sentry = require('@sentry/node')

// todo handle errors in try-catch blocks

module.exports = function(io, sessionStore) {
  const socketService = SocketService(io)
  const sessionCtrl = SessionCtrl(socketService)

  // Authentication for sockets
  io.use(
    passportSocketIo.authorize({
      cookieParser: cookieParser,
      key: 'connect.sid',
      secret: config.sessionSecret,
      store: sessionStore,
      // only allow authenticated users to connect to the socket instance
      fail: (data, message, error, accept) => {
        if (error) {
          console.log(new Error(message))
        } else {
          console.log(message)
          accept(null, false)
        }
      }
    })
  )

  io.on('connection', async function(socket) {
    const user = socket.request.user
    socketService.addUserSocket(user._id, socket)

    if (user.isVolunteer) socket.join('volunteers')

    // On initial connection, emit current session
    SessionService.getCurrentSession(user._id).then(currentSession => {
      socket.emit('session-change', currentSession || {})
    })

    socket.on('disconnect', function(reason) {
      console.log(`${reason} - User ID: ${socket.request.user._id}`)
      socketService.removeUserSocket(socket.request.user._id, socket)
    })

    socket.on('error', function(error) {
      console.log('Socket error: ', error)
      Sentry.captureException(error)
    })

    socket.on('list', async function() {
      const sessions = await SessionService.getUnfulfilledSessions()
      socket.emit('sessions', sessions)
    })

    socket.on('join', async function({ sessionId }) {
      try {
        sessionCtrl.join(socket, {
          sessionId,
          user: socket.request.user
        })
      } catch (err) {
        console.log(err)
      }
    })

    socket.on('typing', async function({ sessionId }) {
      try {
        const userId = socket.request.user._id
        const partnerSockets = await socketService.getPartnerSockets(
          sessionId,
          userId
        )

        for (const socket of partnerSockets) {
          socket.emit('is-typing')
        }
      } catch (err) {
        console.log(err)
      }
    })

    socket.on('notTyping', async function({ sessionId }) {
      try {
        const userId = socket.request.user._id
        const partnerSockets = await socketService.getPartnerSockets(
          sessionId,
          userId
        )

        for (const socket of partnerSockets) {
          socket.emit('not-typing')
        }
      } catch (err) {
        console.log(err)
      }
    })

    socket.on('message', async function({ sessionId, contents }) {
      try {
        const userId = socket.request.user._id
        const partnerSockets = await socketService.getPartnerSockets(
          sessionId,
          userId
        )
        const ownSockets = socketService.getUserSockets(userId)

        const messageData = {
          contents,
          user: userId,
          createdAt: Date.now()
        }

        for (const socket of partnerSockets.concat(ownSockets)) {
          socket.emit('messageSend', messageData)
        }

        await SessionService.addMessage({
          sessionId,
          user: socket.request.user,
          contents
        })
      } catch (err) {
        console.log(err)
      }
    })
  })
}

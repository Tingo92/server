const { get } = require('lodash')
const User = require('../models/User')
const Session = require('../models/Session')
const Message = require('../models/Message')

const userSockets = {} // userId => [sockets]

const getUserSockets = (userId) => {
  return get(userSockets, userId, [])
}

/**
 * Get session data to send to client for a given session ID
 * @param sessionId
 * @returns the session object
 */
async function getSessionData(sessionId) {
  const populateOptions = [
    { path: 'student', select: 'firstname isVolunteer' },
    { path: 'volunteer', select: 'firstname isVolunteer' }
  ]

  return Session.findById(sessionId)
    .populate(populateOptions)
    .lean()
    .exec()
}

module.exports = function(io) {
  return {
    getUserSockets,

    getPartnerSockets: async (sessionId, userId) => {
      const session = await Session.findById(sessionId)
        .lean()
        .exec()

      if (!(session.student && session.volunteer))
        return []

      if (session.student.equals(userId)) {
        return getUserSockets(session.volunteer)
      } else if (session.volunteer.equals(userId)) {
        return getUserSockets(session.student)
      } else {
        return []
      }
    },

    removeUserSocket(userId, socket) {
      if (!userSockets[userId]) return

      const socketIndex = userSockets[userId].findIndex(
        userSocket => socket.id === userSocket.id
      )

      userSockets[userId].splice(socketIndex, 1)
    },

    addUserSocket(userId, socket) {
      if (!userSockets[userId]) userSockets[userId] = []
      userSockets[userId].push(socket)
    },

    emitToUser: function(userId, event, ...args) {
      const sockets = userSockets[userId]
      if (sockets && sockets.length) {
        for (const socket of sockets) {
          socket.emit(event, ...args)
        }
      }
    },

    // update the list of sessions displayed on the volunteer web page
    updateSessionList: async () => {
      const sessions = await Session.getUnfulfilledSessions()
      io.in('volunteers').emit('sessions', sessions)
    },

    emitSessionChange: async function(sessionId) {
      const session = await getSessionData(sessionId)

      if (session.student) {
        this.emitToUser(session.student._id, 'session-change', session)
      }

      if (session.volunteer) {
        this.emitToUser(session.volunteer._id, 'session-change', session)
      }

      await this.updateSessionList()
    },

    bump: function(socket, data, err) {
      console.log('Could not join session')
      console.log(err)
      socket.emit('bump', data, err.toString())
    }
  }
}

const Session = require('../models/Session')
const UserActionCtrl = require('../controllers/UserActionCtrl')
const WhiteboardCtrl = require('../controllers/WhiteboardCtrl')
const sessionService = require('../services/SessionService')
const twilioService = require('../services/twilio')
const Sentry = require('@sentry/node')
const PushTokenService = require('../services/PushTokenService')
const PushToken = require('../models/PushToken')

module.exports = function(socketService) {
  return {
    create: async function(options) {
      var user = options.user || {}
      var userId = user._id
      var type = options.type
      var subTopic = options.subTopic

      if (!userId) {
        throw new Error('Cannot create a session without a user id')
      } else if (user.isVolunteer) {
        throw new Error('Volunteers cannot create new sessions')
      } else if (!type) {
        throw new Error('Must provide a type for a new session')
      }

      var session = new Session({
        student: userId,
        type: type,
        subTopic: subTopic
      })

      const savedSession = await session.save()

      socketService.updateSessionList()

      if (!user.isBanned) {
        twilioService.beginRegularNotifications(savedSession)
        twilioService.beginFailsafeNotifications(savedSession)
      }

      return savedSession
    },

    end: async function({ sessionId, user }) {
      if (!sessionId) {
        throw new Error('No session ID specified')
      }

      const session = await Session.findById(sessionId)
        .lean()
        .exec()

      if (!session) {
        throw new Error('No session found')
      }

      if (session.endedAt) {
        // Session has already ended (the other user ended it)
        return session
      }

      this.verifySessionParticipant(
        session,
        user,
        new Error('Only session participants can end a session')
      )

      await sessionService.endSession(session, user)

      socketService.emitSessionChange(sessionId)

      WhiteboardCtrl.saveDocToSession(sessionId).then(() => {
        WhiteboardCtrl.clearDocFromCache(sessionId)
      })

      return session
    },

    // Currently exposed for Cypress e2e tests
    endAll: async function(user) {
      await Session.update(
        {
          $and: [{ student: user._id }, { endedAt: { $exists: false } }]
        },
        { endedAt: new Date(), endedBy: user._id }
      ).exec()
    },

    // Given a sessionId and userId, join the user to the session and send necessary
    // socket events and notifications
    join: async ({ session, user, userAgent, ipAddress }) => {
      const sessionNotLean = await Session.findById(session._id).exec()
      await sessionNotLean.joinUser(user)
      const isInitialVolunteerJoin = user.isVolunteer && !session.volunteer

      if (isInitialVolunteerJoin) {
        UserActionCtrl.joinedSession(
          user._id,
          session._id,
          userAgent,
          ipAddress
        ).catch(error => Sentry.captureException(error))

        const pushTokens = await PushToken.find({ user: session.student })
          .lean()
          .exec()

        if (pushTokens && pushTokens.length > 0) {
          const tokens = pushTokens.map(token => token.token)
          PushTokenService.sendVolunteerJoined(session, tokens)
        }
      }

      // After 30 seconds of the this.createdAt, we can assume the user is
      // rejoining the session instead of joining for the first time
      const thirtySecondsElapsed = 1000 * 30
      if (
        !isInitialVolunteerJoin &&
        Date.parse(session.createdAt) + thirtySecondsElapsed < Date.now()
      ) {
        UserActionCtrl.rejoinedSession(
          user._id,
          session._id,
          userAgent,
          ipAddress
        ).catch(error => Sentry.captureException(error))
      }

      // TODO: do this in sockets.js
      socketService.emitSessionChange(session._id)
    },

    // verify that a user is a session participant
    verifySessionParticipant: function(session, user, error) {
      // all participants in the session
      const sessionParticipants = [session.student, session.volunteer].filter(
        element => !!element
      )

      if (
        sessionParticipants.findIndex(participant =>
          participant._id.equals(user._id)
        ) === -1
      ) {
        throw error
      }
    }
  }
}

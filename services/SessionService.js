const Session = require('../models/Session')
const User = require('../models/User')
const moment = require('moment-timezone')

module.exports = {
  getSession: async sessionId => {
    return Session.findById(sessionId)
      .lean()
      .exec()
  },

  getCurrentSession: async userId => {
    return Session.findOne({
      $and: [
        { endedAt: { $exists: false } },
        {
          $or: [{ student: userId }, { volunteer: userId }]
        }
      ]
    })
      .sort({ createdAt: -1 })
      .populate({ path: 'volunteer', select: 'firstname isVolunteer' })
      .populate({ path: 'student', select: 'firstname isVolunteer' })
      .lean()
      .exec()
  },

  addPastSession: async function(user, session) {
    const results = await User.update(
      { _id: user._id },
      { $addToSet: { pastSessions: session._id } }
    )
    if (results.nModified === 1) {
      console.log(
        `${session._id} session was added to ` + `${user._id}'s pastSessions`
      )
    }
  },

  addMessage: async ({ sessionId, user, contents }) => {
    const message = {
      user,
      contents
    }
    await Session.updateOne(
      { _id: sessionId },
      { $addToSet: { messages: message } }
    )
  },

  endSession: async function(session, user) {
    const { student, volunteer } = session

    // add session to the student and volunteer's pastSessions
    this.addPastSession(student, session) // TODO: remove `this.`?
    if (volunteer) {
      this.addPastSession(volunteer, session)
    }

    await Session.updateOne(
      { _id: session._id },
      { endedAt: Date.now(), endedBy: user }
    )
  },

  getUnfulfilledSessions: async () => {
    const queryAttrs = {
      volunteerJoinedAt: { $exists: false },
      endedAt: { $exists: false }
    }

    const sessions = await Session.find(queryAttrs)
      .populate({
        path: 'student',
        select: 'firstname isVolunteer isTestUser isBanned pastSessions'
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    const oneMinuteAgo = moment().subtract(1, 'minutes')

    return sessions.filter(session => {
      const isNewStudent =
        session.student.pastSessions &&
        session.student.pastSessions.length === 0
      const wasSessionCreatedAMinuteAgo = moment(oneMinuteAgo).isBefore(
        session.createdAt
      )
      // Don't show new students' sessions for a minute (they often cancel immediately)
      if (isNewStudent && wasSessionCreatedAMinuteAgo) return false
      // Don't show banned students' sessions
      if (session.student.isBanned) return false
      return true
    })
  },

  isSessionFulfilled: function(session) {
    const hasEnded = !!session.endedAt
    const hasVolunteerJoined = !!session.volunteer

    return hasEnded || hasVolunteerJoined
  }
}

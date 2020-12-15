const _ = require('lodash')
const Volunteer = require('../models/Volunteer')
const UserActionCtrl = require('../controllers/UserActionCtrl')
const {
  getAvailability,
  getRecentAvailabilityHistory,
  calculateElapsedAvailability
} = require('../services/AvailabilityService')
const AvailabilityHistoryModel = require('../models/Availability/History')
const AvailabilitySnapshotModel = require('../models/Availability/Snapshot')
const getTodaysDay = require('../utils/get-todays-day')

module.exports = {
  updateSchedule: async function(options) {
    const user = options.user
    const newAvailability = options.availability
    const newTimezone = options.tz
    const ip = options.ip

    // verify that newAvailability is defined and not null
    if (!newAvailability) {
      // early exit
      throw new Error('No availability object specified')
    }

    // verify that all of the day-of-week and time-of-day properties are defined on the
    // new availability object
    if (
      Object.keys(user.availability).some(key => {
        if (typeof newAvailability[key] === 'undefined') {
          // day-of-week property needs to be defined
          return true
        }

        // time-of-day properties also need to be defined
        return Object.keys(user.availability[key]).some(
          key2 => typeof newAvailability[key][key2] === 'undefined'
        )
      })
    ) {
      throw new Error('Availability object missing required keys')
    }

    const currentDate = new Date().toISOString()
    let elapsedAvailability = 0

    if (user.isOnboarded && user.isApproved) {
      const oldAvailability = await getAvailability(
        { volunteerId: user._id },
        { onCallAvailability: 1, createdAt: 1 }
      )
      const recentAvailabilityHistory = await getRecentAvailabilityHistory(
        user._id
      )

      elapsedAvailability = calculateElapsedAvailability({
        availability: oldAvailability.onCallAvailability,
        lastCalculatedAt: recentAvailabilityHistory
          ? recentAvailabilityHistory.createdAt
          : oldAvailability.createdAt,
        currentDate
      })
    }

    const userUpdates = {
      elapsedAvailability: user.elapsedAvailability + elapsedAvailability,
      // @note: keep "availability", "timezone", "availabilityLastModifiedAt" until new availability schema is migrated
      availabilityLastModifiedAt: currentDate,
      availability: newAvailability,
      timezone: newTimezone
    }
    // an onboarded volunteer must have updated their availability, completed required training, and unlocked a subject
    if (!user.isOnboarded && user.subjects.length > 0) {
      userUpdates.isOnboarded = true
      UserActionCtrl.accountOnboarded(user._id, ip)
    }

    const availabilityUpdates = {
      onCallAvailability: newAvailability,
      timezone: newTimezone,
      modifiedAt: currentDate
    }
    // @todo: Make these three db calls a transaction? and/or make them parallel requests
    await AvailabilitySnapshotModel.updateOne(
      {
        volunteerId: user._id
      },
      { availabilityUpdates }
    )

    await AvailabilityHistoryModel.create({
      availability: newAvailability[getTodaysDay()],
      volunteerId: user._id,
      createdAt: currentDate,
      timezone: newTimezone,
      elapsedAvailability
    })
    await Volunteer.updateOne({ _id: user._id }, { userUpdates })
  },

  clearSchedule: async function(user, tz) {
    const clearedAvailability = _.reduce(
      user.availability,
      (clearedWeek, dayVal, dayKey) => {
        clearedWeek[dayKey] = _.reduce(
          dayVal,
          (clearedDay, hourVal, hourKey) => {
            clearedDay[hourKey] = false
            return clearedDay
          },
          {}
        )
        return clearedWeek
      },
      {}
    )

    await this.updateSchedule({ user, tz, availability: clearedAvailability })
  }
}

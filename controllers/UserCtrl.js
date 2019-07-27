var User = require('../models/User')

// helper to check for errors before getting user profile
function getProfileIfSuccessful (callback) {
  return function (err, user) {
    if (err) {
      return callback(err)
    } else {
      user.getProfile(callback)
    }
  }
}

module.exports = {
  // helper to iterate through keys to be added to an update object
  iterateKeys: function (update, data, callback) {
    var hasUpdate = false
    console.log(data['geometry']['passed'])

    ;[
      'firstname',
      'lastname',
      'nickname',
      'picture',
      'birthdate',
      'serviceInterests',
      'gender',
      'race',
      'groupIdentification',
      'computerAccess',
      'preferredTimes',
      'phone',
      'highschool',
      'currentGrade',
      'expectedGraduation',
      'difficultAcademicSubject',
      'difficultCollegeProcess',
      'highestLevelEducation',
      'hasGuidanceCounselor',
      'gpa',
      'college',
      'collegeApplicationsText',
      'commonCollegeDocs',
      'academicInterestsText',
      'testScoresText',
      'advancedCoursesText',
      'favoriteAcademicSubject',
      'extracurricularActivitesText',
      'referred',
      'heardFrom',
      'phonePretty',
      'isTestUser',
      'isAdmin',
      'isVolunteerApproved',
      'geometry',
      'algebra',
      'calculus',
      'trigonometry',
      'applications',
      'planning'
    ].forEach(function (key) {
      if (data.hasOwnProperty(key)) {
        if (data[key].hasOwnProperty('passed')) {
          update[key]['passed'] = data[key]['passed']
        }
        update[key] = data[key]
        hasUpdate = true
      }
    })

    if (!hasUpdate) {
      callback('No fields defined to update')
    } else {
      callback(null, update)
    }
  },
  get: function (options, callback) {
    var userId = options.userId
    User.findById(userId, function (err, user) {
      if (err || !user) {
        callback('Could not get user')
      } else {
        user.getProfile(callback)
      }
    })
  },

  update: function (options, callback) {
    var userId = options.userId

    var data = options.data || {}

    var update = {}

    // Keys to virtual properties
    var virtualProps = ['phonePretty']

    if (virtualProps.some(function (key) { return data[key] })) {
      // load model object into memory
      User.findById(userId, function (err, user) {
        if (err) {
          callback(err)
        } else {
          if (!user) {
            update = new User()
          } else {
            update = user
          }
          iterateKeys(update, data, function (err, update) {
            if (err) {
              return callback(err)
            }
            // save the model that was loaded into memory, processing the virtuals
            update.save(getProfileIfSuccessful(callback))
          })
        }
      })
    } else {
      iterateKeys(update, data, function (err, update) {
        if (err) {
          return callback('No fields defined to update')
        }
        // update the document directly (more efficient, but ignores virtual props)
        User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }, getProfileIfSuccessful(callback))
      })
    }
  }
}

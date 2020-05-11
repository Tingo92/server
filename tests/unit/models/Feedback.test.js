const Feedback = require('../../../models/Feedback')


test('Check default values on Feedback object', () => {
  const feedback = new Feedback()
  expect(feedback.studentId).toBe('')
  expect(feedback.type).toBe('')
  expect(feedback.subTopic).toBe('')
  expect(feedback.userType).toBe('')
  expect(feedback.volunteerId).toBe('')
})

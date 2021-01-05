import { volunteerManifests, studentManifests } from '../../partnerManifests'

test('Example3 volunteer has all data', () => {
  expect(volunteerManifests['example3']['name']).toEqual('Example - Email Requirement & Math Only')
  expect(volunteerManifests['example3']['requiredEmailDomains']).toHaveLength(2)
  expect(volunteerManifests['example3']['requiredEmailDomains'][0]).toEqual('example.org')
})

import config from './config';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

let volunteerManifestsYaml
let studentManifestsYaml

if (process.env.SUBWAY_VOLUNTEER_PARTNER_MANIFESTS === '') {
  const volunteerManifestsPath = path.join(__dirname, config.volunteerPartnerManifestPath)
  volunteerManifestsYaml = fs.readFileSync(volunteerManifestsPath, 'utf8')
} else {
  volunteerManifestsYaml = process.env.SUBWAY_VOLUNTEER_PARTNER_MANIFESTS
}

export const volunteerPartnerManifests = YAML.parse(volunteerManifestsYaml)

if (process.env.SUBWAY_STUDENT_PARTNER_MANIFESTS === '') {
  const studentManifestsPath = path.join(__dirname, config.studentPartnerManifestPath)
  studentManifestsYaml = fs.readFileSync(studentManifestsPath, 'utf8')
} else {
  studentManifestsYaml = process.env.SUBWAY_STUDENT_PARTNER_MANIFESTS
}


export const studentPartnerManifests = YAML.parse(studentManifestsYaml)

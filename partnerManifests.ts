import config from './config';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const volunteerManifestsPath = path.join(__dirname, config.volunteerPartnerManifestPath)
const volunteerManifestsYaml = fs.readFileSync(volunteerManifestsPath, 'utf8')
export const volunteerManifests = YAML.parse(volunteerManifestsYaml)

const studentManifestsPath = path.join(__dirname, config.studentPartnerManifestPath)
const studentManifestsYaml = fs.readFileSync(studentManifestsPath, 'utf8')
export const studentManifests = YAML.parse(studentManifestsYaml)

import moment from 'moment-timezone';
import { DAYS } from '../constants';

const getDayFrom = (daysAgo = 0): string => {
  // @note: a volunteer's availability is currenty being stored in EST timezone
  const day = moment()
    .tz('America/New_York')
    .subtract(daysAgo, 'days')
    .day();

  return DAYS[day];
};

module.exports = getDayFrom;
export default getDayFrom;

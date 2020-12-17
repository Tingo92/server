import moment from 'moment-timezone';
import { DAYS } from '../constants';

const getTodaysDay = (): string => {
  // @note: a volunteer's availability is currenty being stored in EST timezone
  const day = moment()
    .tz('America/New_York')
    .day();
  return DAYS[day];
};

export default getTodaysDay;

import moment from 'moment'

import { DATE_PATTERN, dateFormat } from './date'

describe('dateFormat', () => {
  it('should return the time in h:mm a format when date is same as today', () => {
    const today = moment()

    expect(dateFormat(today)).toEqual(today.format(DATE_PATTERN))
  })

  it('should return the date in MMM Do YYYY format when date is not same as today', () => {
    const yesterday = moment().subtract(1, 'days')

    expect(dateFormat(yesterday)).toEqual(yesterday.format('MMM Do YYYY'))
  })
})

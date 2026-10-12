import moment from 'moment'

import { dateFormat } from './date'

describe('dateFormat', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 4, 12))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses the console time format for dates from today', () => {
    expect(dateFormat(moment(new Date(2026, 9, 4, 9, 5)))).toBe('9:05 am')
  })

  it('uses the console date format for dates before today', () => {
    expect(dateFormat(moment(new Date(2026, 8, 30, 9, 5)))).toBe(
      'Sep 30th 2026'
    )
  })
})

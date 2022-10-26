import moment from 'moment'

const DATE_PATTERN = 'h:mm a'

export function dateFormat(date) {
  if (date.isSame(moment(), 'day')) return date.format(DATE_PATTERN)

  return date.format('MMM Do YYYY')
}

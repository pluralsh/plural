import { useEffect, useState } from 'react'
import { Divider } from 'pluralsh-design-system'
import moment from 'moment'

export function sameDay(message, next) {
  if (!next) return true
  if (next && !next.insertedAt) return false

  const firstTime = moment(message.insertedAt)
  const secondTime = moment(next.insertedAt)

  return firstTime.isSame(secondTime, 'day')
}

export function formatDate(dt) {
  return moment(dt).calendar(null, {
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    lastDay: '[Yesterday]',
    lastWeek: 'dddd',
    sameElse: 'dddd, MMMM Do',
  })
}

export function DateDivider({ message, next, setSize }) {
  const same = sameDay(message, next)
  const [painted, setPainted] = useState(!same)

  useEffect(() => {
    if (!same === painted) {
      setSize()
    }
    setPainted(!same)
  }, [painted, setPainted, same, setSize])

  // if (unread) return <Waterline />
  if (!same) return <Divider text={formatDate(message.insertedAt)} />

  return null
}

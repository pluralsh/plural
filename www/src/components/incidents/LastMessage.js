import React from 'react'
import { Divider } from 'forge-core'

import { formatDate } from './MessageDivider'

export function LastMessage({ date }) {
  return <Divider text={formatDate(date)} />
}

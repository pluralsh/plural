import { Divider } from 'pluralsh-design-system'

import { formatDate } from './MessageDivider'

export function LastMessage({ date }) {
  return <Divider text={formatDate(date)} />
}

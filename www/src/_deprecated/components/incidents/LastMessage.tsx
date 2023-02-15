import { Divider } from '@pluralsh/design-system'

import { formatDate } from './MessageDivider'

export function LastMessage({ date }: any) {
  return <Divider text={formatDate(date)} />
}

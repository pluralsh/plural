import moment from 'moment'
import { Chip, IconFrame } from '@pluralsh/design-system'
import { ReactElement } from 'react'
import styled from 'styled-components'

import { Upgrade } from '../../../../generated/graphql'

export const Wrap = styled.div<{$last: boolean}>(({ theme, $last: last }) => ({
  alignItems: 'center',
  borderBottom: last ? undefined : theme.borders.default,
  display: 'flex',
  gap: theme.spacing.xsmall,
  padding: `${theme.spacing.small}px ${theme.spacing.medium}px`,

  '.repo-name': {
    ...theme.partials.text.body2Bold,
  },

  '.message, .date': {
    ...theme.partials.text.caption,
    color: theme.colors['text-xlight'],
  },

  '.date': {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'end',
    marginLeft: theme.spacing.large,
    marginRight: theme.spacing.medium,
  },
}))

export default function UpgradeListItem({
  upgrade: {
    id, insertedAt, repository, message,
  }, acked, last,
}: { upgrade: Upgrade, acked: string, last: boolean }): ReactElement | null {
  const delivered = acked && id <= acked

  return (
    <Wrap $last={last}>
      <IconFrame
        icon={(
          <img
            src={repository?.darkIcon || repository?.icon || ''}
            width="16"
            height="16"
          />
        )}
        marginRight="xxsmall"
        size="medium"
        type="floating"
      />
      <span className="repo-name">{repository?.name}</span>
      <span className="message">{message}</span>
      <span className="date">{!!insertedAt && moment(insertedAt).format('lll')}</span>
      <Chip
        alignSelf="center"
        severity={delivered ? 'success' : 'neutral'}
        hue="lighter"
      >
        {delivered ? 'Delivered' : 'Pending'}
      </Chip>
    </Wrap>
  )
}

import moment from 'moment'
import { Chip, IconFrame, Tooltip } from '@pluralsh/design-system'
import { ReactElement } from 'react'
import { Flex } from 'honorable'

import { Upgrade } from '../../../../generated/graphql'

export default function UpgradeListItem({
  upgrade: {
    id, insertedAt, repository, message,
  }, acked, last,
}: { upgrade: Upgrade, acked: string, last: boolean }): ReactElement | null {
  const delivered = acked && id <= acked

  return (
    <Flex
      gap="xsmall"
      align="center"
      paddingHorizontal="medium"
      paddingVertical="small"
      borderBottom={last ? undefined : '1px solid border'}
    >
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
        minWidth={32}
      />
      <Flex
        body2
        fontWeight={600}
        whiteSpace="nowrap"
      >
        {repository?.name}
      </Flex>
      <Flex
        caption
        color="text-xlight"
      >
        {message}
      </Flex>
      <Flex grow={1} />
      {insertedAt && (
        <Tooltip
          label={moment(insertedAt).format('lll')}
          placement="top"
        >
          <Flex
            caption
            color="text-xlight"
            marginLeft="large"
            marginRight="medium"
            whiteSpace="nowrap"
          >
            {moment(insertedAt).fromNow()}
          </Flex>
        </Tooltip>
      )}
      <Chip
        alignSelf="center"
        severity={delivered ? 'success' : 'neutral'}
        hue="lighter"
      >
        {delivered ? 'Delivered' : 'Pending'}
      </Chip>
    </Flex>
  )
}

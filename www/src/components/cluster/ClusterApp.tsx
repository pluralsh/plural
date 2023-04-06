import { ReactElement } from 'react'
import { IconFrame } from '@pluralsh/design-system'
import { Flex, Span } from 'honorable'

import { Repository } from '../../generated/graphql'

type ClusterAppProps = {
  app: Repository
  last: boolean
}

export function ClusterApp({ app: { name, icon, darkIcon }, last }: ClusterAppProps): ReactElement {
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
            src={darkIcon || icon || ''}
            width="16"
            height="16"
          />
        )}
        marginRight="xxsmall"
        size="medium"
        type="floating"
      />
      <Span
        body2
        fontWeight={600}
      >
        {name}
      </Span>
    </Flex>
  )
}

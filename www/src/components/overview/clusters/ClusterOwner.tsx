import { AppIcon, Flex } from '@pluralsh/design-system'
import { TRUNCATE } from 'components/utils/Truncate'
import { Body2P, CaptionP } from 'components/utils/Typography'

type ClusterOwnerProps = {
  name?: string | null
  email?: string | null
  avatar?: string | null
}

export default function ClusterOwner({
  name,
  email,
  avatar,
}: ClusterOwnerProps) {
  return (
    <Flex
      gap="small"
      align="center"
      width="100%"
    >
      <AppIcon
        spacing={avatar ? 'none' : undefined}
        name={name || ''}
        url={avatar || undefined}
        size="xxsmall"
      />
      <div css={{ width: '100%', minWidth: 0 }}>
        <Body2P
          as="div"
          css={TRUNCATE}
        >
          {name}
        </Body2P>
        <Flex>
          <CaptionP
            as="div"
            $color="text-xlight"
            css={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexGrow: 1,
              width: 0,
            }}
          >
            {email}
          </CaptionP>
        </Flex>
      </div>
    </Flex>
  )
}

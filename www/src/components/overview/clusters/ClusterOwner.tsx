import { AppIcon } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'

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
      <Div width="100%">
        <Div
          body2
          whiteSpace="nowrap"
        >
          {name}
        </Div>
        <Flex>
          <Div
            caption
            color="text-xlight"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            flexGrow={1}
            width={0}
          >
            {email}
          </Div>
        </Flex>
      </Div>
    </Flex>
  )
}

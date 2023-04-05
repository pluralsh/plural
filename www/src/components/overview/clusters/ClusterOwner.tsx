import { AppIcon } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'

type ClusterOwnerProps = {
    name?: string | null
    email?: string | null
    avatar?: string | null
}

export default function ClusterOwner({ name, email, avatar }: ClusterOwnerProps) {
  return (
    <Flex
      gap="small"
      align="center"
    >
      <AppIcon
        name={name || ''}
        url={avatar || undefined}
        size="xxsmall"
      />
      <div>
        <Div body2>{name}</Div>
        <Div
          caption
          color="text-xlight"
        >
          {email}
        </Div>
      </div>
    </Flex>
  )
}

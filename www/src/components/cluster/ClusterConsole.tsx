import { ClusterFragment, useRepositoryQuery } from '../../generated/graphql'
import { EmptyListMessage } from '../overview/clusters/misc'
import LoadingIndicator from '../utils/LoadingIndicator'

import {
  ArrowTopRightIcon,
  Button,
  Card,
  Flex,
  IconFrame,
} from '@pluralsh/design-system'
import { ignoreEvent } from '../../utils/ignore-event'
import { ensureURLValidity } from '../../utils/url'
import { GqlError } from '../utils/Alert'
import { Body1BoldP } from '../utils/Typography'

const CONSOLE_APP_NAME = 'console'

export function ClusterConsole({
  cluster: { consoleUrl },
}: {
  cluster: ClusterFragment
}) {
  const { data, loading, error } = useRepositoryQuery({
    variables: { name: CONSOLE_APP_NAME },
  })
  const console = data?.repository
  const url = ensureURLValidity(consoleUrl)

  if (error)
    return (
      <GqlError
        header="Could not fetch console details"
        error={error}
      />
    )

  if (!data && loading) return <LoadingIndicator />

  if (!console)
    return (
      <EmptyListMessage>
        Looks like you haven't installed your first app yet.
      </EmptyListMessage>
    )

  return (
    <Card
      clickable={!!url}
      onClick={(e) => {
        ignoreEvent(e)
        if (url) window.open(url, '_blank', 'noopener noreferrer')
      }}
      alignItems="center"
      display="flex"
      gap="medium"
      padding="small"
    >
      <IconFrame
        icon={
          <img
            src={console.darkIcon || console.icon || ''}
            width={32}
            height={32}
          />
        }
        size="large"
        type="floating"
      />
      <Body1BoldP>{console.name}</Body1BoldP>
      <Flex grow={1} />
      {url && (
        <Button
          endIcon={<ArrowTopRightIcon size={14} />}
          small
          onClick={(e) => {
            ignoreEvent(e)
            window.open(url, '_blank', 'noopener noreferrer')
          }}
        >
          Launch
        </Button>
      )}
    </Card>
  )
}

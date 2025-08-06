import { ReactElement } from 'react'

import LoadingIndicator from '../utils/LoadingIndicator'
import { EmptyListMessage } from '../overview/clusters/misc'
import { Cluster, useRepositoryQuery } from '../../generated/graphql'

import { GqlError } from '../utils/Alert'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from 'styled-components'
import {
  IconFrame,
  Flex,
  Card,
  Chip,
  GearTrainIcon,
  Button,
  ArrowTopRightIcon,
} from '@pluralsh/design-system'
import { Body1BoldP } from '../utils/Typography'
import { ensureURLValidity } from '../../utils/url'
import { ignoreEvent } from '../../utils/ignore-event'

const CONSOLE_APP_NAME = 'console'

type ClusterAppsProps = { cluster: Cluster }

export function ClusterConsole({
  cluster: { consoleUrl },
}: ClusterAppsProps): ReactElement {
  const theme = useTheme()
  const navigate = useNavigate()
  const { clusterId } = useParams()
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
      <Chip
        severity={console.installation?.synced ? 'success' : 'warning'}
        size={'small'}
      >
        {console.installation?.synced ? 'Synced' : 'Pending Sync'}
      </Chip>
      {console.installation?.locked && <Chip>Locked</Chip>}
      <Flex grow={1} />
      <Button
        floating
        small
        startIcon={<GearTrainIcon />}
        onClick={(e) => {
          ignoreEvent(e)
          navigate(`/apps/${clusterId}/${console.name}`)
        }}
      >
        Settings
      </Button>
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

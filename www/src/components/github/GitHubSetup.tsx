import {
  AppIcon,
  Button,
  ConsoleIcon,
  EmptyState,
  Flex,
  ListBoxItem,
  Select,
} from '@pluralsh/design-system'
import { Subtitle2H1 } from 'components/utils/Typography'
import ConsoleInstancesContext, {
  ConsoleInstancesContextProvider,
} from 'contexts/ConsoleInstancesContext'
import { useContext, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function GitHubSetup() {
  const [params] = useSearchParams()
  const installationId = params.get('installation_id')
  const setupAction = params.get('setup_action')
  const [selectedInstanceUrl, setSelectedInstanceUrl] = useState('')

  if (setupAction && setupAction !== 'install')
    return (
      <EmptyState message="Invalid setup action. Please try reinstalling the GitHub app." />
    )
  if (!installationId)
    return (
      <EmptyState message="No installation ID found. Please try reinstalling the GitHub app." />
    )

  return (
    <Flex
      padding="xxxlarge"
      direction="column"
      gap="large"
      margin="0 auto"
      width={768}
    >
      <Subtitle2H1>
        Select the cloud instance you'd like to register this app with:
      </Subtitle2H1>
      <Flex
        gap="medium"
        justify="space-between"
        width="100%"
      >
        <ConsoleInstancesContextProvider>
          <ConsoleInstanceSelector
            selectedInstanceUrl={selectedInstanceUrl}
            setSelectedInstanceUrl={setSelectedInstanceUrl}
          />
        </ConsoleInstancesContextProvider>
        <Button
          {...(selectedInstanceUrl
            ? {
                as: Link,
                to: `https://${selectedInstanceUrl}/github/setup?installation_id=${installationId}`,
              }
            : { disabled: true })}
        >
          Register
        </Button>
      </Flex>
    </Flex>
  )
}

function ConsoleInstanceSelector({
  selectedInstanceUrl,
  setSelectedInstanceUrl,
}: {
  selectedInstanceUrl: string
  setSelectedInstanceUrl: (instanceUrl: string) => void
}) {
  const { instances } = useContext(ConsoleInstancesContext)
  return (
    <div css={{ flex: 1 }}>
      <Select
        label="Select a cloud instance"
        selectedKey={selectedInstanceUrl}
        onSelectionChange={(e) =>
          setSelectedInstanceUrl(`${e}`.replace('https://', ''))
        }
      >
        {instances.map((instance) => (
          <ListBoxItem
            key={instance.url}
            label={instance.name}
            leftContent={
              <AppIcon
                size="xxsmall"
                icon={<ConsoleIcon />}
              />
            }
          />
        ))}
      </Select>
    </div>
  )
}

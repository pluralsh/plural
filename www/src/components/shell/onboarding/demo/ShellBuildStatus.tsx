import { Box, Text } from 'grommet'
import { LoopingLogo } from 'pluralsh-design-system'

import Status from './Status'

// TODO find if necessary
// TODO un-grommet this file

export function ShellBuildStatus({ shell: { status } }) {
  if (!status) {
    return <LoopingLogo />
  }

  return (
    <Box
      background="background"
      fill
      align="center"
      justify="center"
    >
      <Box
        width="40%"
        gap="xsmall"
      >
        <Status
          name="Initialized"
          state={status.initialized}
        />
        <Status
          name="Pod Scheduled"
          state={status.podScheduled}
        />
        <Status
          name="Containers Ready"
          state={status.containersReady}
        />
        <Status
          name="Ready"
          state={status.ready}
        />
        <Text
          size="small"
          color="dark-3"
        >
          Give us a minute as your shell instance is provisioning
        </Text>
      </Box>
    </Box>
  )
}

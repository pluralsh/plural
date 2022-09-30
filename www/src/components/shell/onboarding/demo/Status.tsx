import { PropsWithChildren } from 'react'
import { Box, Text } from 'grommet'
import { CheckIcon } from 'pluralsh-design-system'

import { PulsyDiv } from '../../../utils/animations'

// TODO un-grommet this file
type StatusContainerProps = PropsWithChildren<{
  background: string,
  base?: any,
  size?: string,
}>

function StatusContainer({
  children,
  background,
  base,
  size = '25px',
}: StatusContainerProps) {
  return (
    <Box
      flex={false}
      width={size}
      height={size}
      background={background}
      round="full"
      align="center"
      justify="center"
      as={base}
    >
      {children}
    </Box>
  )
}

function UnreadyStatus() {
  return (
    <StatusContainer
      background="progress"
      base={PulsyDiv}
    />
  )
}

function ReadyStatus() {
  return (
    <StatusContainer background="success">
      <CheckIcon size={15} />
    </StatusContainer>
  )
}

function Status({ name, state }) {
  return (
    <Box
      background="card"
      round="xsmall"
      direction="row"
      fill="horizontal"
      align="center"
      pad="small"
    >
      <Box fill="horizontal">
        <Text
          size="small"
          weight={500}
        >
          {name}
        </Text>
      </Box>
      {state && <ReadyStatus />}
      {!state && <UnreadyStatus />}
    </Box>
  )
}

export default Status

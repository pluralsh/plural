import React from 'react'
import { BeatLoader } from 'react-spinners'
import { Checkmark } from 'grommet-icons'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { Box, Text } from 'grommet'

const SIZE = '30px'

function StatusContainer({children, background}) {
  return (
    <Box flex={false} width={SIZE} height={SIZE} background={background} 
         round='full' align='center' justify='center'>
      {children}
    </Box>
  )
}

function UnreadyStatus() {
  return (
    <StatusContainer background='progress'>
      <BeatLoader size={5} />
    </StatusContainer>
  )
}

function ReadyStatus() {
  return (
    <StatusContainer background=''>
      <Checkmark size='15px' />
    </StatusContainer>
  )
}

function Status({name, state}) {
  return (
    <Box background='card' round='xsmall' direction='row' fill='horizontal' align='center'>
      <Box fill='horizontal'>
        <Text size='small' weight={500}>{name}</Text>
      </Box>
      {state && <ReadyStatus />}
      {!state && <UnreadyStatus />}
    </Box>
  )
} 

export function ShellStatus({shell: {status}}) {
  if (!status) return <LoopingLogo dark />

  return (
    <Box fill align='center' justify='center'>
      <Box width='40%' gap='xsmall'>
        <Status name='Initialized' state={status.initialized} />
        <Status name='Pod Scheduled' state={status.podScheduled} />
        <Status name='Containers Ready' state={status.containersReady} />
        <Status name='ready' state={status.ready} />
      </Box>
    </Box>
  )
} 
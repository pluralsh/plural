import React, { useContext } from 'react'
import { Box, Text, ThemeContext } from 'grommet'
import { Checkmark, Alert as AlertError } from 'grommet-icons'
import { normalizeColor } from 'grommet/utils'

export const AlertStatus = {
  ERROR: 'er',
  SUCCESS: 'su'
}

const StatusToColor = {
  er: 'error',
  su: 'good'
}

function AlertIcon({status, color}) {
  switch (status) {
    case AlertStatus.SUCCESS:
      return <Checkmark color={color} size='medium' />
    case AlertStatus.ERROR:
      return <AlertError color={color} size='medium'/>
  }
  return null
}

export function GqlError({header, error}) {
  return (
    <Alert
      status={AlertStatus.ERROR}
      header={header}
      description={error.graphQLErrors[0].message} />
  )
}

export function Alert({status, header, description}) {
  const color = StatusToColor[status]
  const theme = useContext(ThemeContext)

  return (
    <Box pad='small' border={{color}} background={`${normalizeColor(color, theme).toLowerCase()}40`}
        direction='row' gap='medium' align='center' round='xsmall'>
      <AlertIcon status={status} color={color} />
      <Box gap='2px'>
        <Text size='small' weight={500}>{header}</Text>
        <Text size='small'>{description}</Text>
      </Box>
    </Box>
  )
}
import { useContext } from 'react'
import { Box, Text, ThemeContext } from 'grommet'
import { Alert as AlertError, Checkmark, StatusInfo } from 'grommet-icons'
import { normalizeColor } from 'grommet/utils'

export const AlertStatus = {
  ERROR: 'er',
  SUCCESS: 'su',
  INFO: 'in',
}

const StatusToColor = {
  er: 'error',
  su: 'good',
  in: 'progress',
}

function AlertIcon({ status, color }) {
  switch (status) {
    case AlertStatus.SUCCESS:
      return (
        <Checkmark
          color={color}
          size="medium"
        />
      )
    case AlertStatus.ERROR:
      return (
        <AlertError
          color={color}
          size="medium"
        />
      )
    case AlertStatus.INFO:
      return (
        <StatusInfo
          color={color}
          size="medium"
        />
      )
    default:
      // nothing
  }

  return null
}

export function GqlError({ header, error }) {
  return (
    <Alert
      status={AlertStatus.ERROR}
      header={header}
      description={error.graphQLErrors[0].message}
    />
  )
}

export function Alert({ status, header, description }) {
  const color = StatusToColor[status]
  const theme = useContext(ThemeContext)

  return (
    <Box
      fill="horizontal"
      pad="small"
      border={{ color }}
      background={`${normalizeColor(color, theme).toLowerCase()}40`}
      direction="row"
      gap="medium"
      align="center"
      round="xsmall"
    >
      <AlertIcon
        status={status}
        color={color}
      />
      <Box gap="2px">
        <Text
          size="small"
          weight={500}
        >{header}
        </Text>
        <Text size="small">{description}</Text>
      </Box>
    </Box>
  )
}

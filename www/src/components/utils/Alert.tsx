import { useContext } from 'react'
import { Box, Text, ThemeContext } from 'grommet'
import { CheckIcon, ErrorIcon, InfoIcon } from '@pluralsh/design-system'
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

function AlertIcon({ status, color }: any) {
  switch (status) {
  case AlertStatus.SUCCESS:
    return (
      <CheckIcon
        color={color}
        size={16}
      />
    )
  case AlertStatus.ERROR:
    return (
      <ErrorIcon
        color={color}
        size={16}
      />
    )
  case AlertStatus.INFO:
    return (
      <InfoIcon
        color={color}
        size={16}
      />
    )
  default:
    // nothing
  }

  return null
}

export function GqlError({ header, error }: any) {
  return (
    <Alert
      status={AlertStatus.ERROR}
      header={header}
      description={error.graphQLErrors[0].message}
    />
  )
}

export function Alert({ status, header, description }: any) {
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
        >
          {header}
        </Text>
        <Text size="small">{description}</Text>
      </Box>
    </Box>
  )
}

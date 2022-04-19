import { useContext } from 'react'
import { Box, Text } from 'grommet'
import { Select } from 'forge-core'

import { normalizeColor } from 'grommet/utils'

import { ThemeContext } from 'styled-components'

import { CurrentUserContext } from '../login/CurrentUser'

import { canEdit } from './Incident'
import { SeverityColorMap } from './types'

const sevOptions = sev => ({ value: sev, label: `SEV ${sev}` })
const severityOptions = [0, 1, 2, 3, 4, 5].map(sevOptions)

export function SeverityNub({ severity }) {
  const color = severityColor(severity)

  return (
    <Box
      flex={false}
      direction="row"
      align="center"
      gap="xsmall"
    >
      <Box
        flex={false}
        round="full"
        height="10px"
        width="10px"
        background={color}
      />
      <Text size="16px">SEV {severity}</Text>
    </Box>
  )
}

function dot(color, theme) {
  const clr = normalizeColor(color, theme)

  return {
    alignItems: 'center',
    display: 'flex',

    ':before': {
      backgroundColor: clr,
      borderRadius: 10,
      content: '" "',
      display: 'block',
      marginRight: 8,
      height: 10,
      width: 10,
    },
  }
}

export function SeveritySelect({ severity, setSeverity }) {
  const theme = useContext(ThemeContext)

  return (
    <Box
      flex={false}
      width="150px"
    >
      <Select
        styles={{
          option: (styles, { data }) => ({ ...styles, ...dot(severityColor(data.value), theme) }),
          singleValue: (styles, { data }) => ({ ...styles, ...dot(severityColor(data.value), theme) }),
        }}
        options={severityOptions}
        value={sevOptions(severity)}
        onChange={({ value }) => setSeverity(value)}
      />
    </Box>
  )
}

export const severityColor = severity => SeverityColorMap[severity]

export function Severity({ incident: { severity, ...incident }, setSeverity }) {
  const user = useContext(CurrentUserContext)
  const editable = canEdit(incident, user) && setSeverity

  return (
    <>
      {!editable && <SeverityNub severity={severity} />}
      {editable && (
        <SeveritySelect
          severity={severity}
          setSeverity={setSeverity}
        />
      )}
    </>
  )
}

import { useContext } from 'react'
import { Box, Text } from 'grommet'
import { Select } from 'forge-core'

import { ThemeContext } from 'styled-components'

import { normalizeColor } from 'grommet/utils'

import { CurrentUserContext } from '../login/CurrentUser'

import { IncidentStatus, StatusColorMap } from './types'
import { canEdit } from './Incident'

const normalize = val => val.replace('_', ' ')

const textColor = status => StatusColorMap[status]

const options = Object.keys(IncidentStatus).map(status => ({ value: status, label: normalize(status) }))

export function StatusSelector({ status, setStatus }) {
  const theme = useContext(ThemeContext)

  return (
    <Select
      options={options}
      styles={{
        option: (styles, { data, isFocused, isSelected }) => (
          (isFocused || isSelected) ? styles : { ...styles, color: normalizeColor(textColor(data.value), theme) }
        ),
        singleValue: (styles, { data }) => ({ ...styles, color: normalizeColor(textColor(data.value), theme) }),
      }}
      value={{ value: status, label: normalize(status) }}
      onChange={({ value }) => setStatus(value)}
    />
  )
}

export function Status({ incident: { status, ...incident }, setActive }) {
  const user = useContext(CurrentUserContext)
  const editable = canEdit(incident, user) && setActive

  return (
    <>
      {editable && (
        <Box
          flex={false}
          width="150px"
        >
          <StatusSelector
            status={status}
            setStatus={setActive}
          />
        </Box>
      )}
      {!editable && (
        <Box flex={false}>
          <Text
            size="small"
            weight={500}
            color={textColor(status)}
          >{normalize(status)}
          </Text>
        </Box>
      )}
    </>
  )
}

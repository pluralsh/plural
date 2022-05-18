import { Box, Text } from 'grommet'

import { deepFetch } from '../../utils/graphql'

export function validator(object, field, name, func) {
  const val = deepFetch(object, field)
  console.log(val)

  if (!val) return { field: name, message: 'is not set', empty: true }

  const res = func(val)

  return res && { field: name, message: res }
}

export function exists(val) {
  if (val.length > 0) return null

  return 'cannot be an empty string'
}

export function isAlphanumeric(val) {
  console.log(val)
  if (/[a-z][a-z0-9-]+/.test(val)) return null

  return 'must be an alphanumeric string (hyphens allowed)'
}

export function getExceptions(validations, object) {
  if (!validations) return { error: false }

  const allExceptions = validations
                          .map(({ field, name, func }) => validator(object, field, name, func))
                          .filter(v => !!v)

  return { error: allExceptions.length > 0, exceptions: allExceptions }
}

function Exception({ field, message, empty }) {
  if (empty) return null

  return (
    <Box
      direction="row"
      gap="small"
      background="card"
      align="center"
      pad="small"
    >
      <Box
        round="full"
        width="25px"
        height="25px"
        background="orange"
        align="center"
        justify="center"
      >
        <Text size="small">!!</Text>
      </Box>
      <Text size="small">{field} {message}</Text>
    </Box>
  )
}

export function Exceptions({ exceptions }) {
  if (exceptions.length === 0) return null

  return (
    <Box gap="xsmall">
      {exceptions.map(({ field, message, empty }) => (
        <Exception
          key={field}
          field={field}
          message={message}
          empty={empty}
        />
      ))}
    </Box>
  )
}

import { Div, Flex, Text } from 'honorable'
import { ErrorIcon } from 'pluralsh-design-system'

import { deepFetch } from '../../utils/graphql'

export function validator(object, field, name, func) {
  const val = deepFetch(object, field)

  if (!val) {
    if (typeof val === 'string') {
      return { ...stringExists(val), ...{ field: name } }
    }

    return { ...exists(val), ...{ field: name } }
  }

  const res = func(val)

  return res && { ...res, ...{ field: name } }
}

export function exists(val) {
  if (val) return null

  return {
    message: 'is not set',
    type: 'no-empty',
    empty: true,
  }
}

export function stringExists(val) {
  if (val.length > 0) return null

  return {
    message: 'cannot be an empty string',
    type: 'no-empty',
    empty: true,
  }
}

export function isAlphanumeric(val) {
  if (/^[a-zA-Z0-9-]+$/.test(val)) return null

  return { message: "may contain only letters, numbers, or '-'", type: 'alpha-numeric' }
}

export function isValidGitlabName(val) {
  if (!/^[a-zA-Z0-9._-]+$/.test(val)) {
    return { type: 'alpha-numeric', message: "can contain only letters, digits, '_', '-' and '.'" }
  } if (/^[._-]/.test(val)) {
    return { type: 'alpha-numeric', message: "cannot start with '-', '_' or '.'" }
  } if (/[._-]$/.test(val)) {
    return { type: 'alpha-numeric', message: "cannot end with '-', '_' or '.'" }
  } if (/(.atom|.git)$/.test(val)) {
    return { type: 'alpha-numeric', message: "cannot end in '.git' or end in '.atom'" }
  } if (/[._-]{2}/.test(val)) {
    return { type: 'alpha-numeric', message: 'cannot contain consecutive special characters' }
  }

  return null
  // "Path must not start or end with a special character and must not contain consecutive special characters."
}

export function isSubdomain(val) {
  if (/^[a-z][a-z0-9-]*$/.test(val)) return null

  return { type: 'subdomain', message: 'must be a valid subdomain' }
}

export function getExceptions(validations, object) {
  if (!validations) return { error: false }

  const allExceptions = validations
    .map(({ field, name, func }) => validator(object, field, name, func))
    .filter(v => !!v)

  return { error: allExceptions.length > 0, exceptions: allExceptions }
}

// Should probably pull this into the design system at some point
function Exception({ field, message }) {
  return (
    <Flex
      width="100%"
      direction="row"
      marginBottom="xsmall"
      {...{ ':last-child': { marginBottom: 0 } }}
    >
      <Flex
        marginRight="medium"
        align="center"
        justify="center"
      >
        <ErrorIcon
          size={16}
          color="icon-error"
        />
      </Flex>
      <Text
        body2
        color="text-light"
      >
        {`Error: ${field} ${message}`}
      </Text>
    </Flex>
  )
}

export function Exceptions({ exceptions, filterEmpty = true }) {
  if (filterEmpty) {
    exceptions = exceptions.filter(({ empty }) => !empty)
  }

  if (exceptions.length === 0) return null

  return (
    <Div
      mt={1}
      borderRadius="medium"
      backgroundColor="fill-two"
      overflow="hidden"
    >
      <Div
        padding="medium"
        borderTop="3px solid icon-error"
      >
        {exceptions.map(({ field, message, empty }) => (
          <Exception
            key={`${field}-${message}-${empty}`}
            field={field}
            message={message}
          />
        ))}
      </Div>
    </Div>
  )
}

import { Div, Flex, Text } from 'honorable'
import { ErrorIcon } from 'pluralsh-design-system'

import { deepFetch } from '../../utils/graphql'

export function validator(object, field, name, func) {
  const val = deepFetch(object, field)
  console.log(val)

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
  console.log(val)
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

export function getExceptions(validations, object) {
  if (!validations) return { error: false }

  const allExceptions = validations
                          .map(({ field, name, func }) => validator(object, field, name, func))
                          .filter(v => !!v)

  return { error: allExceptions.length > 0, exceptions: allExceptions }
}

function Exception({ field, message }) {
  return (
    <Flex
      width="100%"
      direction="row"
      background="card"
      align="center"
      pad="small"
    >
      <Flex
        marginRight="xsmall"
        align="center"
        justify="center"
      >
        <ErrorIcon
          size={16}
          color="icon-error"
        />
      </Flex>
      <Text body1>{`Error: ${field} ${message}`}</Text>
    </Flex>
  )
}

export function Exceptions({ exceptions, filterEmpty = true }) {
  if (filterEmpty) {
    exceptions = exceptions.filter(({ empty }) => !empty)
  }
  if (exceptions.length === 0) return null

  console.log('exceptions', exceptions)

  return (
    <Div
      mt={1}
      borderRadius="medium"
      border="1px solid border-fill-two"
      backgroundColor="fill-two"
      padding="xsmall"
    >
      {exceptions.map(({ field, message, empty }) => {
        console.log('exception', field, message, empty)

        return (
          <Exception
            key={`${field}-${message}-${empty}`}
            field={field}
            message={message}
            empty={empty}
          />
        )
      })}
    </Div>
  )
}

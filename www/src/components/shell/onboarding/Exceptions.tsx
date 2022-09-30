import { Div, Flex, Text } from 'honorable'
import { ErrorIcon } from 'pluralsh-design-system'

// Should probably pull this into the design system at some point
function Exception({ field, message }) {
  return (
    <Flex
      width="100%"
      direction="row"
      marginBottom="xsmall"
      _lastChild={{ marginBottom: 0 }}
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

function Exceptions({ exceptions, filterEmpty = true }) {
  const workingExceptions = filterEmpty ? exceptions.filter(({ empty }) => !empty) : exceptions

  if (workingExceptions.length === 0) return null

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
        {workingExceptions.map(({ field, message, empty }) => (
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

export default Exceptions

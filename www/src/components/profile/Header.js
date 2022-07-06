import { Box } from 'grommet'
import { Flex, H1, Span } from 'honorable'

export function Header({ header, description, children }) {
  return (
    <Flex
      borderBottom="1px solid border"
      align="center"
    >
      <Box fill="horizontal">
        <Box
          gap="8px"
          pad={{ vertical: 'small' }}
        >
          <H1>{header}</H1>
          <Span
            color="text-light"
            body1
          >{description}
          </Span>
        </Box>
      </Box>
      {children}
    </Flex>
  )
}

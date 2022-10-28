import { Box, Text } from 'grommet'
import { Flex, H1, Span } from 'honorable'

export function Header({ header, description, children }: any) {
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
          <H1 title1>{header}</H1>
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

export function HeaderItem({
  text, width, nobold, truncate,
}: any) {
  return (
    <Box width={width}>
      <Text
        size="small"
        weight={nobold ? undefined : 500}
        truncate={truncate}
      >
        {text}
      </Text>
    </Box>
  )
}

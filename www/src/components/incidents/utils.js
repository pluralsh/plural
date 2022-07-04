import { Box, Text } from 'grommet'

export function Attribute({ name, children, size }) {
  return (
    <Box
      direction="row"
      align="center"
      fill="horizontal"
      pad="small"
    >
      <Box width={size || '80px'}>
        <Text
          size="small"
          weight="bold"
        >{name}
        </Text>
      </Box>
      <Box fill="horizontal">
        {children}
      </Box>
    </Box>
  )
}

export function Attributes({ children, ...props }) {
  return (
    <Box
      border
      round="xsmall"
      {...props}
    >
      <Box
        fill="horizontal"
        gap="none"
        border={{ side: 'between' }}
      >
        {children}
      </Box>
    </Box>
  )
}

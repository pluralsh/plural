import { Box } from 'grommet'
import { Span } from 'honorable'

export function Info({ text, description, ...box }: any) {
  return (
    <Box
      fill="horizontal"
      {...box}
    >
      <Span fontWeight="bold">{text}</Span>
      <Span color="text-light">{description}</Span>
    </Box>
  )
}

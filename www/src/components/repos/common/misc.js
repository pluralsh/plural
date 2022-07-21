import { H1 } from 'honorable'
import { Box } from 'grommet'

export function PackageViewHeader({ children }) {
  return (
    <Box
      border="bottom"
      pad={{ bottom: 'medium' }}
    >
      <H1>{children}</H1>
    </Box>
  )
}

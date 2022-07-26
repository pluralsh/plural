import { Box } from 'grommet'

export function ListItem({
  first, last, children, background,
}) {
  return (
    <Box
      flex={false}
      background={{ color: background || 'fill-one' }}
      direction="row"
      align="center"
      pad={{ vertical: 'small', horizontal: 'medium' }}
      border={first ? { side: 'all' } : [{ side: 'vertical' }, { side: 'bottom' }]}
      round={first ? { corner: 'top', size: '3px' } : (last ? { corner: 'bottom', size: '3px' } : null)}
    >{children}
    </Box>
  )
}

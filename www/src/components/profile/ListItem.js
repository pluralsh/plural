import { Box } from 'grommet'

export function ListItem({ first, last, children }) {
  return (
    <Box
      flex={false}
      background={{ color: 'fill-one' }}
      direction="row"
      align="center"
      pad={{ vertical: 'small', horizontal: 'medium' }}
      border={!last ? { side: 'all' } : [{ side: 'vertical' }, { side: 'bottom' }]}
      round={first ? { corner: 'top', size: 'small' } : (last ? { corner: 'bottom', size: 'small' } : null)}
    >{children}
    </Box>
  )
}

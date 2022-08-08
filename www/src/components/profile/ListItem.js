import { Box } from 'grommet'

const BORDER_RADIUS = '6px'

export function ListItem({
  first, last, children, background,
}) {
  const r = corner => ({ corner, size: BORDER_RADIUS })

  return (
    <Box
      flex={false}
      background={{ color: background || 'fill-one' }}
      direction="row"
      align="center"
      pad="16px"
      border={first ? { side: 'all' } : [{ side: 'vertical' }, { side: 'bottom' }]}
      round={(first && last) ? BORDER_RADIUS : (first ? r('top') : ((last ? r('bottom') : null)))}
    >{children}
    </Box>
  )
}

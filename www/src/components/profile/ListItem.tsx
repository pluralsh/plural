import { ThemeContext } from 'styled-components'
import { Box } from 'grommet'
import { useContext } from 'react'

export function ListItem({ first, last, children, background }: any) {
  const theme = useContext(ThemeContext)

  const BORDER_RADIUS = `${theme.borderRadiuses.large}px`
  const r = (corner) => ({ corner, size: BORDER_RADIUS })

  return (
    <Box
      flex={false}
      background={{ color: background || 'fill-one' }}
      direction="row"
      align="center"
      pad="16px"
      border={
        first ? { side: 'all' } : [{ side: 'vertical' }, { side: 'bottom' }]
      }
      // @ts-expect-error
      round={
        first && last
          ? BORDER_RADIUS
          : first
          ? r('top')
          : last
          ? r('bottom')
          : null
      }
    >
      {children}
    </Box>
  )
}

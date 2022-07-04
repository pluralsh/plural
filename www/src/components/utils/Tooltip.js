import { Box, Drop } from 'grommet'

export function Tooltip({ children, background, align, target, side, ...props }) {
  return (
    <Drop
      plain
      style={{ boxShadow: 'none' }}
      className={`tooltip ${side || 'bottom'}`}
      align={align || { bottom: 'top' }}
      target={target.current}
    >
      <Box
        direction="row"
        align="center"
        justify="center"
        round="xsmall"
        background={background || 'sidebar'}
        pad="xsmall"
        {...props}
      >
        {children}
      </Box>
    </Drop>
  )
}

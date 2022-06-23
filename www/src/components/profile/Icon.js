import { Box } from 'grommet'
import { TrashCanIcon } from 'pluralsh-design-system'
import { forwardRef } from 'react'

export const Icon = forwardRef(({ icon, onClick, hover }, ref) => (
  <Box
    ref={ref}
    pad="6px"
    round="xsmall"
    onClick={onClick}
    hoverIndicator={hover || 'fill-two'}
  >
    {icon}
  </Box>
)
)

export function DeleteIcon({ onClick }) {
  return (
    <Icon
      onClick={onClick}
      icon={(
        <TrashCanIcon
          size={15}
          color="icon-error"
        />
      )}
    />
  )
}

import { Box } from 'grommet'
import { TrashCanIcon } from 'pluralsh-design-system'

export function Icon({ icon, onClick, hover }) {
  return (
    <Box
      pad="small"
      round="xsmall"
      onClick={onClick}
      hoverIndicator={hover || 'fill-two'}
    >
      {icon}
    </Box>
  )
}

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

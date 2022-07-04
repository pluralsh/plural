import { Box, Text } from 'grommet'
import { Close } from 'grommet-icons'

export const ignore = e => {
  e.preventDefault(); e.stopPropagation()
}

export function ModalHeader({ text, setOpen }) {
  return (
    <Box
      direction="row"
      border={{ side: 'bottom', color: 'border' }}
      pad="small"
    >
      <Box fill="horizontal">
        <Text
          size="small"
          weight="bold"
        >{text}
        </Text>
      </Box>
      <Box
        flex={false}
        pad="xsmall"
        round="xsmall"
        hoverIndicator="light-3"
        onClick={e => setOpen(false, e)}
      >
        <Close size="small" />
      </Box>
    </Box>
  )
}

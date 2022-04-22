import { Box, Text } from 'grommet'
import { CloseIcon } from 'pluralsh-design-system'

export function ModalHeader({ text, setOpen }) {
  return (
    <Box
      direction="row"
      pad={{ horizontal: 'medium', top: 'medium' }}
      align="center"
    >
      <Text>
        {text}
      </Text>
      <div style={{ flexGrow: 1 }} />
      {typeof setOpen === 'function' && (
        <Box
          hoverIndicator="background"
          onClick={() => setOpen(false)}
          round="full"
          pad="small"
          style={{ margin: -12 }}
        >
          <CloseIcon />
        </Box>
      )}
    </Box>
  )
}

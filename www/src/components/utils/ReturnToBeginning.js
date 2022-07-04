import { Box, Layer, Text } from 'grommet'
import { Up } from 'grommet-icons'

export function ReturnToBeginning({ beginning }) {
  return (
    <Layer
      position="bottom-right"
      modal={false}
      plain
    >
      <Box
        direction="row"
        align="center"
        round="xsmall"
        gap="small"
        hoverIndicator="cardHover"
        background="card"
        margin={{ bottom: 'medium', right: 'small' }}
        pad="small"
        focusIndicator={false}
        onClick={beginning}
      >
        <Box
          direction="row"
          fill="horizontal"
          justify="center"
        >
          <Text size="small">go to most recent</Text>
        </Box>
        <Up size="15px" />
      </Box>
    </Layer>
  )
}

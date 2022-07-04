import { Box, Text } from 'grommet'
import { Next } from 'grommet-icons'
import { Portal } from 'react-portal'

const FLYOUT_ID = 'flyout-container'

export function Flyout({ width, title, setOpen, children, ...rest }) {
  return (
    <Portal node={document.getElementById(FLYOUT_ID)}>
      <Box
        width={width}
        flex={false}
        fill="vertical"
        border={{ side: 'left' }}
        {...rest}
      >
        <Box
          flex={false}
          pad="small"
          direction="row"
          align="center"
          height="45px"
          border={{ side: 'bottom' }}
        >
          <Box fill="horizontal">
            <Text
              size="small"
              weight={500}
            >{title}
            </Text>
          </Box>
          <Box
            flex={false}
            pad="xsmall"
            round="xsmall"
            onClick={() => setOpen(false)}
            hoverIndicator="fill-one"
          >
            <Next size="small" />
          </Box>
        </Box>
        <Box fill>
          {children}
        </Box>
      </Box>
    </Portal>
  )
}

export function FlyoutContainer() {
  return (
    <Box
      flex={false}
      id={FLYOUT_ID}
    />
  )
}

import './installation.css'
import { Box, Text } from 'grommet'

const BORDER_ATTRS = { side: 'top', size: '2px' }

export function Tab({ name, setTab, selected }) {
  const active = selected === name

  return (
    <Box
      flex={false}
      background={active ? 'white' : 'light-1'}
      className={`installation-tab${active ? ' selected' : ' unselected'}`}
      pad="small"
      focusIndicator={false}
      border={active ? { ...BORDER_ATTRS, color: 'brand' } : null}
      hoverIndicator="light-2"
      onClick={active ? null : () => setTab(name)}
    >
      <Text
        size="small"
        weight={500}
      >{name}
      </Text>
    </Box>
  )
}

function TabFiller() {
  return (
    <Box
      fill="horizontal"
      border={{ side: 'bottom', color: 'border' }}
    />
  )
}

export function Tabs({ children }) {
  return (
    <Box
      flex={false}
      className="installation-tabs"
      direction="row"
    >
      {children}
      <TabFiller />
    </Box>
  )
}

export function TabContent({ children }) {
  return (
    <Box className="installation-container">
      {children}
    </Box>
  )
}

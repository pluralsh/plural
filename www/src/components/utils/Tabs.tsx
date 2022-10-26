import './installation.css'
import { Children, cloneElement, forwardRef } from 'react'
import { Box, Text } from 'grommet'
import styled from 'styled-components'

import { UnstyledLink } from './Link'

export const LinkTabWrap = styled(forwardRef(({
  className, active, vertical, children, textValue: _textValue, subTab: _, ...props
}, ref) => (
  <UnstyledLink
    ref={ref}
    className={className}
    $extendStyle={{ display: 'block' }}
    {...props}
  >
    {cloneElement(Children.only(children), {
      active,
      vertical,
    })}
  </UnstyledLink>
)))(({
  theme, vertical, subTab, $extendStyle,
}) => ({
  ...(vertical ? { width: '100%' } : {}),
  ...(subTab ? { borderRadius: theme.borderRadiuses.medium } : {}),
  ...$extendStyle,
}))

/* DEPRECATED */
const BORDER_ATTRS = { side: 'top', size: '2px' }

export function Tab({ name, setTab, selected }: any) {
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

export function Tabs({ children }: any) {
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

export function TabContent({ children }: any) {
  return (
    <Box className="installation-container">
      {children}
    </Box>
  )
}

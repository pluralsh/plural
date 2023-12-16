import './installation.css'
import {
  Children,
  ComponentProps,
  ReactElement,
  cloneElement,
  forwardRef,
} from 'react'
import { Box, Text } from 'grommet'
import { Link } from 'react-router-dom'
import styled, { CSSProperties } from 'styled-components'
import { TabBaseProps } from '@pluralsh/design-system'
import { UnstyledLink } from './Link'

const LinkTabWrapUnstyled = forwardRef(
  (
    {
      className,
      active,
      vertical,
      children,
      textValue: _textValue,
      subTab: _,
      ...props
    }: ComponentProps<typeof Link> &
      TabBaseProps & { children: ReactElement; subTab?: boolean },
    ref
  ) => (
    <UnstyledLink
      ref={ref as any}
      className={className}
      $extendStyle={{ display: 'block' }}
      {...props}
    >
      {cloneElement(Children.only(children), {
        active,
        vertical,
      })}
    </UnstyledLink>
  )
)

export const LinkTabWrap = styled(LinkTabWrapUnstyled)<{
  $extendStyle?: CSSProperties
}>(({ theme, vertical, subTab, $extendStyle }) => ({
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
      border={active ? ({ ...BORDER_ATTRS, color: 'brand' } as any) : undefined}
      hoverIndicator="light-2"
      onClick={active ? undefined : () => setTab(name)}
    >
      <Text
        size="small"
        weight={500}
      >
        {name}
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
  return <Box className="installation-container">{children}</Box>
}

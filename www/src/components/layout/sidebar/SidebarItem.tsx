import { Tooltip, WrapWithIf } from '@pluralsh/design-system'
import { ComponentPropsWithRef, ReactNode, use } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import styled, { DefaultTheme } from 'styled-components'

import { SidebarContext } from './SidebarContext'

type SidebarItemProps = ComponentPropsWithRef<'button'> & {
  tooltip?: ReactNode
  expandedLabel?: ReactNode
  active?: boolean
} & ({ asLink?: never } | ({ asLink: true } & LinkProps))

// Expanded items bleed into their section's padding so every icon sits the
// same distance from the sidebar edge; collapsed ones are centered squares.
export function sidebarItemLayout(theme: DefaultTheme, isExpanded: boolean) {
  return {
    flexShrink: 0,
    flexGrow: 0,
    height: 40,
    padding: theme.spacing.small,
    ...(isExpanded
      ? {
          alignSelf: 'stretch',
          width: 'auto',
          margin: `0 -${theme.spacing.xsmall}`,
        }
      : { alignSelf: 'center', width: 40 }),
  } as const
}

// fill-accent is near-white in light mode, so the dark-mode fill tokens
// would vanish against it; darken it slightly instead.
export function sidebarItemFills(theme: DefaultTheme) {
  const darken = (pct: number) =>
    `color-mix(in srgb, ${theme.colors['fill-accent']}, #000 ${pct}%)`

  return theme.mode === 'light'
    ? { selected: darken(4), hover: darken(2.5) }
    : {
        selected: theme.colors['fill-zero-selected'],
        hover: theme.colors['fill-zero-hover'],
      }
}

export function SidebarItem({
  asLink,
  tooltip,
  expandedLabel,
  active,
  children,
  ...props
}: SidebarItemProps) {
  const { isExpanded } = use(SidebarContext)

  return (
    <WrapWithIf
      condition={!!tooltip && !isExpanded}
      wrapper={
        <Tooltip
          label={tooltip}
          placement="right"
          css={{ whiteSpace: 'nowrap' }}
        />
      }
    >
      <ItemSC
        as={asLink ? Link : 'button'}
        {...props}
        $active={!!active}
        $isExpanded={isExpanded}
      >
        {children}
        {isExpanded && expandedLabel ? (
          <LabelSC>{expandedLabel}</LabelSC>
        ) : null}
      </ItemSC>
    </WrapWithIf>
  )
}

const LabelSC = styled.span({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

const ItemSC = styled.button<{
  $active: boolean
  $isExpanded: boolean
}>(({ theme, $active, $isExpanded }) => {
  const fills = sidebarItemFills(theme)

  return {
    boxSizing: 'border-box',
    ...theme.partials.reset.button,
    ...theme.partials.text.body2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: $isExpanded ? 'flex-start' : 'center',
    gap: theme.spacing.xsmall,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ...sidebarItemLayout(theme, $isExpanded),
    borderRadius: theme.borderRadiuses.medium,
    overflow: 'hidden',
    color: theme.colors['icon-light'],
    background: $active ? fills.selected : 'transparent',
    cursor: 'pointer',
    '&:hover': { background: $active ? undefined : fills.hover },
    '&:focus-visible': { outline: theme.borders['outline-focused'] },
  }
})

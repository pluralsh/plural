import { ComponentProps, ReactNode } from 'react'
import styled, { useTheme } from 'styled-components'

const ListItemSC = styled.div<{ $first: boolean; $last: boolean }>(
  ({ theme, $first: first, $last: last }) => {
    const BORDER_RADIUS = theme.borderRadiuses.large

    return {
      display: 'flex',
      flex: '0 0',
      backgroundColor: theme.colors['fill-one'],
      alignItems: 'center',
      padding: 16,
      borderTop: first ? theme.borders.default : undefined,
      borderBottom: theme.borders.default,
      borderLeft: theme.borders.default,
      borderRight: theme.borders.default,
      borderBottomRightRadius: last ? BORDER_RADIUS : undefined,
      borderBottomLeftRadius: last ? BORDER_RADIUS : undefined,
      borderTopRightRadius: first ? BORDER_RADIUS : undefined,
      borderTopLeftRadius: first ? BORDER_RADIUS : undefined,
    }
  }
)

export function ListItem({
  first,
  last,
  ...props
}: {
  first: boolean
  last: boolean
} & ComponentProps<typeof ListItemSC>) {
  const theme = useTheme()

  return (
    <ListItemSC
      $first={first}
      $last={last}
      {...props}
    />
  )
}

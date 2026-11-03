import styled from 'styled-components'
import { Card, type CardProps } from '@pluralsh/design-system'
import {
  type CSSProperties,
  type ComponentPropsWithRef,
  createContext,
  useContext,
  useMemo,
} from 'react'

type Hue = 'default' | 'lighter' | 'lightest'

const ListContext = createContext<{ hue: Hue }>({ hue: 'default' })

const LiBare = styled.li<{ $extendStyle?: Record<string, any> }>(
  ({ $extendStyle }) => ({
    margin: 0,
    textIndent: 0,
    padding: 0,
    listStyle: 'none',
    ...$extendStyle,
  })
)

const hueToBorderColor: Record<Hue | 'none', string> = {
  none: 'border',
  default: 'border',
  lighter: 'border-fill-two',
  lightest: 'border-fill-three',
}

export const hueToFillLevel = {
  default: 1,
  lighter: 2,
  lightest: 3,
} as const satisfies Record<Hue, CardProps['fillLevel']>

const ListItemInner = styled(LiBare)<{
  $last?: boolean
  $hue?: string
  $first?: boolean
}>(({ theme, $last = false, $hue = 'default' }) => ({
  padding: `${theme.spacingPx.xsmall}px ${theme.spacingPx.medium}px`,
  borderBottomStyle: $last ? 'none' : 'solid',
  borderColor: theme.colors[hueToBorderColor[$hue]] || 'transparent',
  borderWidth: '1px',

  '&:hover': {
    backgroundColor: theme.colors['fill-one-hover'],
  },
}))

type ListItemProps = ComponentPropsWithRef<'li'> & {
  first?: boolean
  last?: boolean
}

function ListItem({ first, last, ...props }: ListItemProps) {
  const { hue } = useContext(ListContext)

  return (
    <ListItemInner
      $first={first}
      $last={last}
      $hue={hue}
      {...props}
    />
  )
}

type ListProps = Omit<CardProps, 'fillLevel'> & {
  hue?: Hue
  position?: CSSProperties['position']
}

function List({ hue = 'default', position, children, ...props }: ListProps) {
  const listContext = useMemo(
    () => ({
      hue,
    }),
    [hue]
  )

  return (
    <ListContext.Provider value={listContext}>
      <ListCardSC
        forwardedAs="ul"
        fillLevel={hueToFillLevel[hue]}
        cornerSize="large"
        {...props}
        overflow="hidden"
        $position={position}
      >
        {children}
      </ListCardSC>
    </ListContext.Provider>
  )
}

const ListCardSC = styled(Card)<{ $position?: CSSProperties['position'] }>(
  ({ $position }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    margin: 0,
    flexGrow: 1,
    ...($position ? { position: $position } : {}),
  })
)

export { List, ListItem, ListContext, hueToBorderColor }

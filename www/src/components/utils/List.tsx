import styled from 'styled-components'
import { Card, CardProps } from '@pluralsh/design-system'
import {
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useMemo,
} from 'react'
import { Ul } from 'honorable'

type Hue = Required<CardProps>['hue']

const ListContext = createContext<{ hue: Hue }>({ hue: 'default' })

const LiBare = styled.li(({ $extendStyle }: { $extendStyle?: Record<string, any> }) => ({
  margin: 0,
  textIndent: 0,
  padding: 0,
  listStyle: 'none',
  ...$extendStyle,
}))

const hueToBorderColor: Record<Hue | 'none', string> = {
  none: 'border',
  default: 'border',
  lighter: 'border-fill-two',
  lightest: 'border-fill-three',
}

const ListItemInner = styled(LiBare)<{
  $last?: boolean
  $hue?: string
  $first?: boolean
}>(({ theme, $last = false, $hue = 'default' }) => ({
  padding: `${theme.spacing.xsmall}px ${theme.spacing.medium}px`,
  borderBottomStyle: $last ? 'none' : 'solid',
  borderColor: theme.colors[hueToBorderColor[$hue]] || 'transparent',
  borderWidth: '1px',
}))

type ListItemProps = any & {
  first: boolean
  last: boolean
  children: ReactNode
}

const ListItem = forwardRef<HTMLLIElement, ListItemProps>(({ first, last, ...props }, ref) => {
  const { hue } = useContext(ListContext)

  return (
    <ListItemInner
      ref={ref}
      $first={first}
      $last={last}
      $hue={hue}
      {...props}
    />
  )
})

type ListProps = any & {
  hue?: Hue
  children: ReactNode
}

const List = forwardRef<HTMLDivElement, ListProps>(({ hue = 'default', children, ...props }, ref) => {
  const listContext = useMemo(() => ({
    hue,
  }),
  [hue])

  return (
    <ListContext.Provider value={listContext}>
      <Card
        ref={ref}
        hue={hue}
        display="flex"
        alignItems="top"
        flexDirection="column"
        cornerSize="large"
        padding={0}
        margin={0}
        flexGrow={1}
        maxHeight="min-content"
        {...props}
        overflow="hidden"
        as={Ul}
      >
        {children}
      </Card>
    </ListContext.Provider>
  )
})

export {
  List, ListItem, ListContext, hueToBorderColor,
}

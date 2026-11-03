import { Children, ComponentProps, ReactElement, cloneElement } from 'react'
import { Link } from 'react-router-dom'
import styled, { CSSProperties } from 'styled-components'
import { TabBaseProps } from '@pluralsh/design-system'

import { UnstyledLink } from './Link'

function LinkTabWrapUnstyled({
  className,
  active,
  vertical,
  children,
  textValue: _textValue,
  subTab: _,
  ...props
}: Omit<ComponentProps<typeof Link>, 'children'> &
  Omit<TabBaseProps, 'children'> & {
    children: ReactElement<TabBaseProps>
    subTab?: boolean
  }) {
  return (
    <UnstyledLink
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
}

export const LinkTabWrap = styled(LinkTabWrapUnstyled)<{
  $extendStyle?: CSSProperties
}>(({ theme, vertical, subTab, $extendStyle }) => ({
  ...(vertical ? { width: '100%' } : {}),
  ...(subTab ? { borderRadius: theme.borderRadiuses.medium } : {}),
  ...$extendStyle,
}))

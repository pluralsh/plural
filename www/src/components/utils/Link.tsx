import { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export function SafeLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <span onClick={e => e.stopPropagation()}>
      <Link {...props}>{children}</Link>
    </span>
  )
}

const unstyledStyles = ({ $extendStyle }) => ({
  textDecoration: 'none',
  ...$extendStyle,
})

export const UnstyledLink: (
  props: ComponentProps<typeof Link>
) => JSX.Element = styled(Link)(unstyledStyles)

export const UnstyledSafeLink: (
  props: ComponentProps<typeof Link>
) => JSX.Element = styled(SafeLink)(unstyledStyles)

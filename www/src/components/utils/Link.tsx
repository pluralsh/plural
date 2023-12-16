import { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export function SafeLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Link {...props}>{children}</Link>
    </span>
  )
}
type UnstyledLinkProps = { $extendStyle?: object }
const unstyledStyles = ({ $extendStyle }: UnstyledLinkProps) => ({
  textDecoration: 'none',
  ...$extendStyle,
})

export const UnstyledLink = styled(Link)(unstyledStyles)

export const UnstyledSafeLink = styled(SafeLink)(unstyledStyles)

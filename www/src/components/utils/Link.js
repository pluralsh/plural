import { Link } from 'react-router-dom'
import styled from 'styled-components'

export function SafeLink({ children, ...props }) {
  return (
    <span onClick={e => e.stopPropagation()}>
      <Link {...props}>{children}</Link>
    </span>
  )
}

const unstyledStyles = ({ extendStyle }) => ({
  textDecoration: 'none',
  ...extendStyle,
})

export const UnstyledLink = styled(Link)(unstyledStyles)

export const UnstyledSafeLink = styled(SafeLink)(unstyledStyles)

import { Link } from 'react-router-dom'

export function SafeLink({ children, ...props }) {
  return (
    <span onClick={e => e.stopPropagation()}>
      <Link {...props}>{children}</Link>
    </span>
  )
}

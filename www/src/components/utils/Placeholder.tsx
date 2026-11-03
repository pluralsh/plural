import styled from 'styled-components'

export function Placeholder() {
  return <PlaceholderSC />
}

const PlaceholderSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '0 0 auto',
  boxSizing: 'border-box',
  height: 50,
  padding: theme.spacing.small,
}))

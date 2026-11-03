import styled from 'styled-components'

export const EmptyListMessage = styled.div(({ theme }) => ({
  color: theme.colors['text-xlight'],
  padding: `${theme.spacingPx.small}px ${theme.spacingPx.medium}px`,
}))

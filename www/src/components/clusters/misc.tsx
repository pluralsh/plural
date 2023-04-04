import styled from 'styled-components'

export const EmptyListMessage = styled.div(({ theme }) => ({
  color: theme.colors['text-xlight'],
  padding: `${theme.spacing.small}px ${theme.spacing.medium}px`,
}))

import { Card, type CardProps } from '@pluralsh/design-system'
import styled from 'styled-components'

export function ContentCard({ children, ...props }: CardProps) {
  return (
    <Card
      overflowY="auto"
      {...props}
    >
      <ContentCardInnerSC>{children}</ContentCardInnerSC>
    </Card>
  )
}

const ContentCardInnerSC = styled.div(({ theme }) => ({
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: 608 + 2 * theme.spacingPx.xlarge,
  margin: '0 auto',
  padding: theme.spacing.xlarge,
}))

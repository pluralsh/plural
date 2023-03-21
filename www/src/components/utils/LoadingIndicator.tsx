import { LoopingLogo } from '@pluralsh/design-system'
import styled from 'styled-components'

const LoadingIndicatorWrap = styled.div(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.xlarge,
}))

export default function LoadingIndicator() {
  return (
    <LoadingIndicatorWrap>
      <LoopingLogo />
    </LoadingIndicatorWrap>
  )
}

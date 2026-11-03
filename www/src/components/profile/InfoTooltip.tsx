import { InfoIcon, Tooltip } from '@pluralsh/design-system'
import { type ReactNode } from 'react'
import styled from 'styled-components'

export function InfoTooltip({ label }: { label: ReactNode }) {
  return (
    <Tooltip
      label={label}
      style={{ width: 315 }}
    >
      <InfoIconWrapperSC>
        <InfoIcon />
      </InfoIconWrapperSC>
    </Tooltip>
  )
}

const InfoIconWrapperSC = styled.div({
  display: 'flex',
  flex: '0 0 auto',
  padding: 6,
})

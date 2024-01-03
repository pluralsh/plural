import { ReactNode, useRef } from 'react'
import { AnimatedDiv, Card } from '@pluralsh/design-system'
import { useSpring } from '@react-spring/web'
import styled, { useTheme } from 'styled-components'
import { createPortal } from 'react-dom'

import { useCursorPosition } from './CursorPosition'

const ChartTooltipSC = styled.div.attrs(() => ({}))((_) => ({
  width: '0',
  height: '0',
}))
const ChartTooltipContentSC = styled(Card).attrs(() => ({
  fillLevel: 2,
}))(({ theme }) => ({
  '&&': {
    ...theme.partials.text.caption,
    display: 'flex',
    paddingLeft: theme.spacing.xsmall,
    paddingRight: theme.spacing.xsmall,
    paddingBottom: theme.spacing.xxsmall,
    paddingTop: theme.spacing.xxsmall,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xsmall,
    transform: `translate(-50%, calc(-${theme.spacing.small}px - 100%))`,
  },
}))
const ChartTooltipSwatchSC = styled.div.attrs(() => ({
  'aria-hidden': true,
}))<{ $color: string }>(({ $color }) => ({
  width: 12,
  height: 12,
  backgroundColor: $color,
}))
const springConfig = {
  mass: 1,
  tension: 105,
  friction: 12,
  precision: 0.01,
}

export function ChartTooltip({
  color,
  label,
  value,
}: {
  color: string
  label: ReactNode
  value: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const cursorPos = useCursorPosition()
  const theme = useTheme()

  const [springProps] = useSpring(
    () => ({
      ...cursorPos,
      config: springConfig,
    }),
    [cursorPos]
  )

  const content = (
    <AnimatedDiv
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: theme.zIndexes.tooltip,
        pointerEvents: 'none',
        ...springProps,
      }}
    >
      <ChartTooltipContentSC>
        <ChartTooltipSwatchSC $color={color} />
        <div>
          {label}: <b>{value}</b>
        </div>
      </ChartTooltipContentSC>
    </AnimatedDiv>
  )

  return (
    <ChartTooltipSC ref={ref as any}>
      {createPortal(content, document.body)}
    </ChartTooltipSC>
  )
}

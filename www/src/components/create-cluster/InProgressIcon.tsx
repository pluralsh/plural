import { SemanticColorKey } from '@pluralsh/design-system'
import styled, { keyframes, useTheme } from 'styled-components'

export function InProgressIcon({
  size = 16,
  color = 'icon-warning',
}: {
  size?: number
  color?: SemanticColorKey
}) {
  const theme = useTheme()

  return (
    <SpinnerSvgSC
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle
        cx={8}
        cy={8}
        r={6.5}
        stroke={theme.colors['border-fill-two']}
        strokeWidth={1.5}
      />
      <path
        d="M8 1.5A6.5 6.5 0 0 1 14.5 8"
        stroke={theme.colors[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </SpinnerSvgSC>
  )
}

const spin = keyframes({ to: { transform: 'rotate(360deg)' } })

const SpinnerSvgSC = styled.svg`
  flex-shrink: 0;
  animation: ${spin} 1s linear infinite;
`

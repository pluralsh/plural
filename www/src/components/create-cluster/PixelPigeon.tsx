import styled, { keyframes } from 'styled-components'

type Pixel = [x: number, y: number, width: number, height: number, fill: string]

const BODY: Pixel[] = [
  [1, 11, 3, 1, '#383D47'],
  [0, 12, 4, 1, '#2A2E37'],
  [1, 13, 3, 1, '#383D47'],
  [9, 7, 7, 1, '#2C7A86'],
  [8, 8, 8, 1, '#7B6FD6'],
  [3, 9, 13, 5, '#C5C9D2'],
  [12, 9, 4, 5, '#E3E4E7'],
  [5, 14, 9, 1, '#C5C9D2'],
  [5, 9, 7, 4, '#A1A5B0'],
  [6, 10, 5, 1, '#5D626F'],
  [7, 12, 4, 1, '#4C505C'],
  [7, 15, 1, 2, '#E8A33D'],
  [11, 15, 1, 2, '#E8A33D'],
  [6, 17, 3, 1, '#E8A33D'],
  [10, 17, 3, 1, '#E8A33D'],
]

const HEAD: Pixel[] = [
  [11, 3, 5, 4, '#E3E4E7'],
  [13, 4, 2, 2, '#E8A33D'],
  [14, 4, 1, 1, '#171A21'],
  [16, 5, 2, 1, '#A1A5B0'],
  [16, 4, 1, 1, '#EEF0F1'],
  [10, 0, 6, 2, '#8B7FE0'],
  [9, 2, 9, 1, '#7B6FD6'],
  [11, 1, 1, 1, '#EEF0F1'],
  [12, 1, 3, 1, '#C5C9D2'],
]

const SEEDS = [
  'calc(60% + 33px)',
  'calc(60% + 38px)',
  'calc(6% - 4px)',
  'calc(6% - 9px)',
]

function Pixels({ pixels }: { pixels: Pixel[] }) {
  return pixels.map(([x, y, width, height, fill]) => (
    <rect
      key={`${x}-${y}-${fill}`}
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
    />
  ))
}

export function PixelPigeon({ duration = 20 }: { duration?: number }) {
  return (
    <PigeonSC
      aria-hidden="true"
      $duration={duration}
    >
      {SEEDS.map((left) => (
        <span
          key={left}
          className="seed"
          style={{ left }}
        />
      ))}
      <div className="track">
        <div className="flip">
          <svg
            className="bird"
            width="36"
            height="36"
            viewBox="0 0 18 18"
            shapeRendering="crispEdges"
          >
            <Pixels pixels={BODY} />
            <g className="head">
              <Pixels pixels={HEAD} />
            </g>
          </svg>
        </div>
      </div>
    </PigeonSC>
  )
}

const walk = keyframes({
  '0%': { left: '6%' },
  '35%': { left: '60%' },
  '50%': { left: '60%' },
  '85%': { left: '6%' },
  '100%': { left: '6%' },
})

const flip = keyframes({
  '0%': { transform: 'scaleX(1)' },
  '50%': { transform: 'scaleX(-1)' },
  '100%': { transform: 'scaleX(1)' },
})

const hop = keyframes({
  '0%': { transform: 'translateY(0)' },
  '100%': { transform: 'translateY(-1px)' },
})

const peck = keyframes({
  '0%, 36%': { transform: 'none' },
  '37%': { transform: 'translate(1px, 3px)' },
  '39%': { transform: 'none' },
  '41%': { transform: 'translate(1px, 3px)' },
  '43%': { transform: 'none' },
  '45%': { transform: 'translate(1px, 3px)' },
  '47%, 86%': { transform: 'none' },
  '87%': { transform: 'translate(1px, 3px)' },
  '89%': { transform: 'none' },
  '91%': { transform: 'translate(1px, 3px)' },
  '93%': { transform: 'none' },
  '95%': { transform: 'translate(1px, 3px)' },
  '97%, 100%': { transform: 'none' },
})

const PigeonSC = styled.div<{ $duration: number }>`
  position: relative;
  height: 36px;
  border-bottom: ${({ theme }) => theme.borders.default};
  pointer-events: none;

  .seed {
    position: absolute;
    bottom: 0;
    width: 2px;
    height: 2px;
    background: #f5c28d;
  }

  .track {
    position: absolute;
    bottom: 0;
    left: 6%;
    width: 36px;
    height: 36px;
    animation: ${walk} ${({ $duration }) => $duration}s linear infinite;
  }

  .flip {
    width: 36px;
    height: 36px;
    transform-origin: 50% 50%;
    animation: ${flip} ${({ $duration }) => $duration}s step-end infinite;
  }

  .bird {
    display: block;
    overflow: visible;
    animation: ${hop} 0.5s steps(2) infinite;
  }

  .head {
    animation: ${peck} ${({ $duration }) => $duration}s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .track,
    .flip,
    .bird,
    .head {
      animation: none;
    }
  }
`

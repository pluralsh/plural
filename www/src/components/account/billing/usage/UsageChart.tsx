import { ResponsiveLine } from '@nivo/line'
import moment from 'moment'
import styled, { useTheme } from 'styled-components'

import { UsagePoint } from './usageRange'

export function UsageChart({
  id,
  label,
  total,
  daily,
  format,
  color,
  height = 166,
  ticks = 2,
}: {
  id: string
  label: string
  total: number
  daily: UsagePoint[]
  format: (value: number) => string
  color: string
  height?: number
  ticks?: number
}) {
  const theme = useTheme()
  const gradientId = `usage-gradient-${id}`
  const tickDates = Array.from(
    { length: ticks },
    (_, i) =>
      daily[Math.round((i * (daily.length - 1)) / Math.max(ticks - 1, 1))]?.date
  )

  return (
    <ChartCardSC>
      <div className="label">{label}</div>
      <div className="value">{format(total)}</div>
      <ChartSC style={{ height }}>
        <ResponsiveLine
          data={[
            {
              id: label,
              data: daily.map(({ date, value }) => ({ x: date, y: value })),
            },
          ]}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          xScale={{ type: 'time', format: 'native', precision: 'day' }}
          yScale={{ type: 'linear', min: 0, max: 'auto' }}
          curve="monotoneX"
          colors={[color]}
          lineWidth={1.5}
          enableArea
          areaOpacity={1}
          defs={[
            {
              id: gradientId,
              type: 'linearGradient',
              colors: [
                { offset: 0, color, opacity: 0.4 },
                { offset: 100, color, opacity: 0 },
              ],
            },
          ]}
          fill={[{ match: '*', id: gradientId }]}
          enablePoints={false}
          enableGridX={false}
          enableGridY={false}
          axisLeft={null}
          axisBottom={null}
          useMesh
          tooltip={({ point }) => (
            <TooltipSC>
              <span className="date">
                {moment.utc(point.data.x).format('ddd, MMM D')}
              </span>
              <span>{format(Number(point.data.y))}</span>
            </TooltipSC>
          )}
          crosshairType="x"
          animate={false}
          theme={{
            crosshair: {
              line: {
                stroke: theme.colors['text-light'],
                strokeOpacity: 0.5,
              },
            },
          }}
        />
      </ChartSC>
      <AxisSC>
        {tickDates.map((date, i) => (
          <span key={i}>{moment.utc(date).format('MMM D')}</span>
        ))}
      </AxisSC>
    </ChartCardSC>
  )
}

const ChartCardSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  padding: theme.spacing.large,
  borderRadius: theme.borderRadiuses.large,
  border: theme.borders.default,
  backgroundColor: theme.colors['fill-accent'],
  '.label': {
    ...theme.partials.text.caption,
    color: theme.colors['text-xlight'],
  },
  '.value': {
    ...theme.partials.text.body2Bold,
    color: theme.colors.text,
    fontVariantNumeric: 'tabular-nums',
  },
}))

const ChartSC = styled.div(({ theme }) => ({
  marginTop: theme.spacing.medium,
}))

const AxisSC = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing.xsmall,
  fontFamily: theme.fontFamilies.mono,
  fontSize: 10,
  lineHeight: '22px',
  color: theme.colors['text-input-disabled'],
}))

const TooltipSC = styled.div(({ theme }) => ({
  ...theme.partials.text.caption,
  display: 'flex',
  flexDirection: 'column',
  padding: `${theme.spacing.xsmall} ${theme.spacing.small}`,
  borderRadius: theme.borderRadiuses.medium,
  border: theme.borders['fill-two'],
  backgroundColor: theme.colors['fill-two'],
  boxShadow: theme.boxShadows.moderate,
  color: theme.colors.text,
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
  '.date': { color: theme.colors['text-xlight'] },
}))

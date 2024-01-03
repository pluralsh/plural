import { useTheme } from 'styled-components'
import { ResponsiveChoropleth } from '@nivo/geo'
import { max } from 'lodash'

import { ChartTooltip } from './ChartTooltip'

import countries from './world_countries.json'

function Tooltip({ feature }) {
  if (!feature.data) return null
  const { id, value } = feature.data

  return (
    <ChartTooltip
      color={feature.color}
      label={id}
      value={value}
    />
  )
}

export function Chloropleth({ data }) {
  const maximum: number = max(data.map(({ value }) => value)) ?? 0
  const theme = useTheme()
  const colors = [
    theme.colors.blue[400],
    theme.colors.blue[500],
    theme.colors.blue[600],
    theme.colors.blue[700],
    theme.colors.blue[800],
  ]

  return (
    <ResponsiveChoropleth
      data={data}
      theme={{ textColor: theme.colors.text }}
      features={countries.features}
      label="properties.name"
      valueFormat=".2s"
      domain={[0, maximum + 1]}
      colors={colors}
      unknownColor={theme.colors['fill-two']}
      enableGraticule
      graticuleLineColor={theme.colors.border}
      borderWidth={0.5}
      isInteractive
      borderColor={theme.colors['border-fill-two']}
      projectionType="naturalEarth1"
      tooltip={Tooltip}
      legends={[
        {
          anchor: 'bottom-left',
          direction: 'column',
          justify: true,
          translateX: 48,
          translateY: -48,
          itemsSpacing: 0,
          itemWidth: 94,
          itemHeight: 18,
          itemDirection: 'left-to-right',
          itemOpacity: 0.85,
          symbolSize: 18,
          effects: [
            {
              on: 'hover',
              style: {
                itemTextColor: '#fff',
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  )
}

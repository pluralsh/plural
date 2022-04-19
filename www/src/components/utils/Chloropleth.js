import { useContext } from 'react'
import { Box, Text, ThemeContext } from 'grommet'
import { ResponsiveChoropleth } from '@nivo/geo'
import max from 'lodash.max'
import { normalizeColor } from 'grommet/utils'

import countries from './world_countries.json'
import { useColorMap } from './Graph'

const COLOR_MAP = [
  'blue-light-2',
  'blue-light',
  'blue',
  'blue-dark',
  'blue-dark-2',
]

function Tooltip({ feature }) {
  if (!feature.data) return null

  const { id, value } = feature.data

  return (
    <Box
      flex={false}
      direction="row"
      pad="xsmall"
      round="2px"
      gap="xsmall"
      background="white"
      align="center"
    >
      <Box
        flex={false}
        height="12px"
        width="12px"
        background={feature.color}
      />
      <Text
        size="12px"
        weight={500}
      >
        {id} {value}
      </Text>
    </Box>
  )
}

export function Chloropleth({ data }) {
  const maximum = max(data.map(({ value }) => value))
  const theme = useContext(ThemeContext)
  const colors = useColorMap(theme, COLOR_MAP)

  return (
    <ResponsiveChoropleth
      data={data}
      theme={{ textColor: normalizeColor('dark-5', theme) }}
      features={countries.features}
      label="properties.name"
      valueFormat=".2s"
      domain={[0, maximum + 1]}
      colors={colors}
      unknownColor={normalizeColor('dark-5', theme)}
      enableGraticule
      graticuleLineColor={normalizeColor('card', theme)}
      borderWidth={0.5}
      isInteractive
      onClick={console.log}
      borderColor={normalizeColor('cardHover', theme)}
      projectionType="naturalEarth1"
      tooltip={Tooltip}
      legends={[
        {
          anchor: 'bottom-left',
          direction: 'column',
          justify: true,
          translateX: 20,
          translateY: -100,
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

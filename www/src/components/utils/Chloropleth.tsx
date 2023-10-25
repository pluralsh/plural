import { Box, Text } from 'grommet'
import { ResponsiveChoropleth } from '@nivo/geo'
import max from 'lodash/max'
import { useTheme } from 'styled-components'

import { normalizeColor } from 'grommet/utils'

import { useColorMap } from './colors'

import countries from './world_countries.json'

const COLOR_MAP = [
  'blue-light-2',
  'blue-light',
  'blue',
  'blue-dark',
  'blue-dark-2',
]

function Tooltip({ feature }: any) {
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
        color="black"
      >
        {id} {value}
      </Text>
    </Box>
  )
}

export function Chloropleth({ data }: any) {
  const maximum = max(data.map(({ value }) => value)) as number
  const theme = useTheme()
  const colors = useColorMap(theme, COLOR_MAP)

  return (
    <ResponsiveChoropleth
      data={data}
      theme={{ textColor: normalizeColor('text-xlight', theme) }}
      features={countries.features}
      label="properties.name"
      valueFormat=".2s"
      domain={[0, maximum + 1]}
      colors={colors}
      unknownColor={normalizeColor('fill-two', theme)}
      enableGraticule
      graticuleLineColor={normalizeColor('fill-three', theme)}
      borderWidth={0.5}
      borderColor={normalizeColor('cardHover', theme)}
      projectionType="naturalEarth1"
      projectionScale={150}
      tooltip={Tooltip}
      legends={[
        {
          anchor: 'left',
          direction: 'column',
          justify: true,
          translateX: 50,
          itemWidth: 96,
          itemHeight: 16,
          itemOpacity: 0.85,
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

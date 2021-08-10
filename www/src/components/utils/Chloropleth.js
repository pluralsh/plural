import React, { useContext } from 'react'
import { ThemeContext } from 'grommet'
import { ResponsiveChoropleth } from '@nivo/geo'
import countries from './world_countries'
import { useColorMap } from './Graph'
import { max } from 'lodash'

const COLOR_MAP = [
  'blue-light-2',
  'blue-light', 
  'blue', 
  'blue-dark',
  'blue-dark-2'
]

export function Chloropleth({data}) {
  const maximum = max(data.map(({value}) => value))
  const theme = useContext(ThemeContext)
  const colors = useColorMap(theme, COLOR_MAP)

  return (
    <ResponsiveChoropleth
      data={data}
      features={countries.features}
      label="properties.name"
      valueFormat=".2s"
      domain={[ 0, maximum + 1 ]}
      colors={colors}
      unknownColor="#666666"
      enableGraticule={true}
      graticuleLineColor="#dddddd"
      borderWidth={0.5}
      isInteractive={true}
      onClick={console.log}
      borderColor="#152538"
      projectionType='naturalEarth1'
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
            itemTextColor: '#444444',
            itemOpacity: 0.85,
            symbolSize: 18,
            effects: [
                {
                    on: 'hover',
                    style: {
                        itemTextColor: '#000000',
                        itemOpacity: 1
                    }
                }
            ]
        }
    ]} />
  )
}
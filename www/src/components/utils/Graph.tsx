import { Key, useContext, useMemo, useState } from 'react'

import { ResponsiveLine } from '@nivo/line'
import moment from 'moment'
import last from 'lodash/last'
import { Box, Text, ThemeContext } from 'grommet'
import { Card } from '@pluralsh/design-system'
import { Flex, P, Span } from 'honorable'
import { DefaultTheme, useTheme } from 'styled-components'

import { DEFAULT_THEME } from '../../theme'
import { useColorMap } from '../../utils/color'

export function dateFormat(date) {
  return moment(date).format('MM/DD h:mm:ss A')
}

const graphTheme = (theme: DefaultTheme) => ({
  ...DEFAULT_THEME,
  axis: {
    ticks: {
      text: {
        fill: theme.colors['text-xlight'],
      },
      line: {
        stroke: theme.colors.border,
      },
    },
    legend: {
      text: {
        fill: theme.colors['text-light'],
      },
    },
  },
  grid: {
    line: {
      stroke: theme.colors.border,
    },
  },
})

export function GraphHeader({ text }: any) {
  return (
    <Box
      direction="row"
      align="center"
      justify="center"
    >
      <Text
        size="small"
        weight="bold"
      >
        {text}
      </Text>
    </Box>
  )
}

function SliceTooltip({ point: { serieColor, serieId, data } }) {
  return (
    <Card
      display="flex"
      alignItems="center"
      fillLevel={2}
      paddingVertical="xxsmall"
      paddingHorizontal="xsmall"
      direction="row"
      gap="xsmall"
      caption
    >
      <Flex
        width={12}
        height={12}
        backgroundColor={serieColor}
      />
      <div>
        {serieId}: <Span style={{ fontWeight: 700 }}>{data.yFormatted}</Span>
        <br />
        {data.xFormatted}
      </div>
    </Card>
  )
}

export function Graph({ data, yFormat, tick }: any) {
  const styledTheme = useTheme()
  const theme = useContext(ThemeContext)
  const colors = useColorMap(theme)

  const [selected, setSelected] = useState<any>(null)
  const graph = useMemo(() => {
    if (data.find(({ id }) => id === selected)) {
      return data.filter(({ id }) => id === selected)
    }

    return data
  }, [data, selected])

  if (graph.length === 0) return <Text size="small">No data available.</Text>

  const hasData = !!graph[0].data[0]

  return (
    <ResponsiveLine
      data={graph}
      margin={{
        top: 50,
        right: 110,
        bottom: 75,
        left: 70,
      }}
      areaOpacity={0.5}
      useMesh
      lineWidth={2}
      enablePoints={false}
      enableGridX={false}
      animate={false}
      xScale={{ type: 'time', format: 'native' }}
      yScale={{
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: false,
        reverse: false,
      }}
      colors={colors}
      yFormat={yFormat}
      xFormat={dateFormat}
      tooltip={SliceTooltip}
      axisLeft={
        {
          orient: 'left',
          tickSize: 5,
          format: yFormat,
          tickPadding: 5,
          tickRotation: 0,
          legendOffset: -50,
          legendPosition: 'start',
        } as any
      }
      axisBottom={
        {
          format: '%H:%M',
          tickValues: tick || 'every 5 minutes',
          orient: 'bottom',
          legendPosition: 'middle',
          legend: hasData
            ? `${dateFormat(data[0].data[0].x)} to ${dateFormat(
                (last(data[0].data) as any).x
              )}`
            : null,
          legendOffset: 46,
        } as any
      }
      pointLabel="y"
      pointLabelYOffset={-15}
      legends={[
        {
          anchor: 'bottom-right',
          onClick: ({ id }) => (selected ? setSelected(null) : setSelected(id)),
          direction: 'column',
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          symbolSize: 12,
          symbolShape: 'circle',
          itemTextColor: styledTheme.colors['text-xlight'],
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemTextColor: styledTheme.colors['text-light'],
              },
            },
          ],
        },
      ]}
      theme={graphTheme(styledTheme)}
    />
  )
}

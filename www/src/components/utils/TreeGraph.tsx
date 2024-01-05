import { useEffect, useId, useRef } from 'react'
import { Box } from 'grommet'
import { hierarchy, tree as treeLayout } from 'd3-hierarchy'
import { select } from 'd3-selection'
import { Div, Span } from 'honorable'
import { DefaultTheme, useTheme } from 'styled-components'

function diagonal(d) {
  return `M${d.x},${d.y}C${d.x},${(d.y + d.parent.y) / 2} ${d.parent.x},${
    (d.y + d.parent.y) / 2
  } ${d.parent.x},${d.parent.y}`
}

function renderTree(id, tree, height, width, theme: DefaultTheme) {
  const margin = {
    top: 50,
    right: 90,
    bottom: 50,
    left: 90,
  }
  const layoutWidth = width - margin.left - margin.right
  const layoutHeight = height - margin.top - margin.bottom
  const treemap = treeLayout().size([layoutWidth, layoutHeight])

  // Give the data to this cluster layout:
  const root = hierarchy(tree, (d) => d.children)

  treemap(root)
  const svg = select(`#${CSS.escape(id)}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Add the links between nodes:
  svg
    .selectAll('path')
    .data(root.descendants().slice(1))
    .enter()
    .append('path')
    .attr('d', diagonal)
    .style('fill', 'none')
    .attr('stroke', (d) => {
      console.log('d', d)

      return d.data.strokeColor || theme.colors.text
    })
    .attr('stroke-dasharray', (d) => d.data.strokeDasharray || '0')

  const nodes = svg
    .selectAll('g')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('transform', (d) => `translate(${d.x}, ${d.y})`)

  nodes
    .append('text')
    .style('fill', theme.colors.text)
    .attr('dy', '.35em')
    .attr('y', (d) => (d.children ? -32 : 32))
    .style('text-anchor', 'middle')
    .text((d) => d.data.name)

  nodes
    .append('svg:image')
    .attr('x', -12)
    .attr('y', (d) => (d.children ? -25 : 0))
    .attr('width', 25)
    .attr('height', 25)
    .attr('xlink:href', (d) => d.data.image)
}

export default function TreeGraph({ tree, width, height, legend }: any) {
  const id = useId()
  const theme = useTheme()
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!boxRef.current) return
    const { width, height } = boxRef.current.getBoundingClientRect()

    renderTree(id, tree, height, width, theme)
    const { current } = boxRef

    return () => {
      console.log('removing', current)
      if (current) {
        current.innerHTML = ''
      }
    }
  }, [id, boxRef, tree, theme])

  return (
    <div
      css={{
        position: 'relative',
      }}
    >
      <div
        id={id}
        ref={boxRef}
        className="svg-box"
        css={{
          position: 'relative',
          overflow: 'hidden',
          width,
          height,
        }}
      />
      {legend && (
        <div
          css={{
            position: 'absolute',
            top: 0,
            right: 8,
          }}
        >
          {Object.entries(legend).map(([k, v], index) => (
            <Box
              key={index}
              direction="row"
              align="center"
              gap="small"
              margin={{ bottom: 'xsmall' }}
            >
              <Div
                backgroundColor="fill-one"
                border="1px solid border"
                borderRadius={4}
                width="32px"
                height="32px"
              >
                <svg
                  viewBox="0 0 32 32"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid"
                >
                  <line
                    x1="4"
                    y1="16"
                    x2="28"
                    y2="16"
                    stroke={(v as any).color}
                    strokeDasharray={(v as any).dasharray}
                  />
                </svg>
              </Div>
              <Span>{k}</Span>
            </Box>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { Box } from 'grommet'
import { hierarchy, tree as treeLayout } from 'd3-hierarchy'
import { select } from 'd3-selection'

function diagonal(d) {
  return `M${d.x},${d.y}C${d.x},${(d.y + d.parent.y) / 2} ${d.parent.x},${(d.y + d.parent.y) / 2} ${d.parent.x},${d.parent.y}`
}

function renderTree(id, tree, height, width) {
  const margin = { top: 50, right: 90, bottom: 50, left: 90 }
  const layoutWidth = width - margin.left - margin.right
  const layoutHeight = height - margin.top - margin.bottom
  const treemap = treeLayout()
    .size([layoutWidth, layoutHeight])

  // Give the data to this cluster layout:
  const root = hierarchy(tree, d => d.children)
  treemap(root)
  const svg = select(`#${id}`)
    .append('svg')
      .attr('width', width)
      .attr('height', height)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
  // Add the links between nodes:
  svg.selectAll('path')
    .data(root.descendants().slice(1))
    .enter()
    .append('path')
    .attr('d', diagonal)
    .style('fill', 'none')
    .attr('stroke', d => d.data.strokeColor || '#ccc')

  const nodes = svg.selectAll('g')
    .data(root.descendants())
    .enter()
    .append('g')
      .attr('style', 'border: 1px solid black')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)

  nodes.append('text')
      .style('fill', 'white')
      .attr('dy', '.35em')
      .attr('y', d => d.children ? -32 : 32)
      .style('text-anchor', 'middle')
      .text(d => d.data.name)

  nodes
      .append('svg:image')
      .attr('x', -12)
      .attr('y', d => d.children ? -25 : 0)
      .attr('width', 25)
      .attr('height', 25)
      .attr('xlink:href', d => d.data.image)
}

export default function TreeGraph({ id, tree, width, height }) {
  const boxRef = useRef()

  useEffect(() => {
    if (!boxRef.current) return
    const { width, height } = boxRef.current.getBoundingClientRect()
    renderTree(id, tree, height, width)
    const { current } = boxRef

    return () => current.removeChild(current.children[0])
  }, [id, boxRef, tree])

  return (
    <Box
      style={{ overflow: 'auto' }}
      ref={boxRef}
      id={id}
      width={width}
      height={height}
    />
  )
}

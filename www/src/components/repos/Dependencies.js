import React from 'react'
import {Box, Text} from 'grommet'
import TreeGraph from '../utils/TreeGraph'
import { DEFAULT_TF_ICON, DEFAULT_CHART_ICON } from './constants'

function asDep({__typename, name, children}) {
  switch (__typename) {
    case "Terraform":
      return {name: name, image: DEFAULT_TF_ICON, children}
    default:
      return {name: name, image: DEFAULT_CHART_ICON, children}
  }
}

export default function Dependencies(resource) {
  const {name, dependencies} = resource
  if (!dependencies || !dependencies.dependencies) {
    return (
      <Box pad='small'>
        <Text size='small'>No dependencies</Text>
      </Box>
    )
  }
  const deps = dependencies.dependencies.map((dep) => {
    if (dep.type === "TERRAFORM") return {...dep, image: DEFAULT_TF_ICON}
    if (dep.type === "HELM") return {...dep, image: DEFAULT_CHART_ICON}
    return dep
  })

  return (
    <TreeGraph
      id={`${name}-tree`}
      tree={asDep({...resource, children: deps})}
      width='100%'
      height='400px' />
  )
}
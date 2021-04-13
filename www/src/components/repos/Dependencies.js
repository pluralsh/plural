import React from 'react'
import { Box, Text } from 'grommet'
import { useQuery } from 'react-apollo'
import { SecondaryButton } from 'forge-core'
import TreeGraph from '../utils/TreeGraph'
import { DEFAULT_TF_ICON, DEFAULT_CHART_ICON, Tools } from './constants'
import { CLOSURE_Q } from './queries'
import { remove, cloneDeep } from 'lodash'

const GRAPH_HEIGHT = '500px'

function asDep({__typename, name: depname, version, children}) {
  console.log(version)
  const name = `${depname} ${version || ''}`
  switch (__typename) {
    case "Terraform":
      return {name, image: DEFAULT_TF_ICON, children}
    default:
      return {name, image: DEFAULT_CHART_ICON, children}
  }
}

function depType({__typename}) {
  switch (__typename) {
    case "Terraform":
      return Tools.TERRAFORM
    default:
      return Tools.HELM
  }
}

const key = ({repo, name}) => `${repo}:${name}`

function mapify(deps) {
  let map = {}
  for (let dep of deps) {
    map[key(dep)] = true
  }
  return map
}

function compileGraph(resource, closure) {
  if (!resource.dependencies || !resource.dependencies.dependencies)
    return asDep({...resource, children: []})

  const {dependencies: {dependencies}} = resource
  const isHelmDep = mapify(dependencies.filter(({type}) => type === Tools.HELM))
  const isTfDep = mapify(dependencies.filter(({type}) => type === Tools.TERRAFORM))

  let helmChildren = remove(closure.helm, ({name, repository}) => isHelmDep[`${repository.name}:${name}`])
  let terraformChildren = remove(closure.terraform, ({name, repository}) => isTfDep[`${repository.name}:${name}`])
  let children = helmChildren.concat(terraformChildren).map((child) => compileGraph(child, closure))
  return asDep({...resource, children})
}

export function ShowFull({onClick, label}) {
  return (
    <Box width='100px'>
      <SecondaryButton label={label} round='xsmall' onClick={onClick} />
    </Box>
  )
}

export function FullDependencies({resource}) {
  const {data, loading} = useQuery(CLOSURE_Q, {
    variables: {id: resource.id, type: depType(resource)}
  })

  if (loading || !data) return null
  const graph = compileGraph(resource, cloneDeep(data.closure))

  return (
    <TreeGraph
      id={`${resource.name}-full-tree`} tree={graph}
      width='100%' height={GRAPH_HEIGHT} />
  )
}

export default function Dependencies({name, dependencies, resource}) {
  if (!dependencies || !dependencies.dependencies) {
    return (
      <Box pad='small'>
        <Text size='small'>No dependencies</Text>
      </Box>
    )
  }

  const deps = dependencies.dependencies.map(({name, version, ...dep}) => {
    if (dep.type === Tools.TERRAFORM) return {...dep, name: `${name} ${version || ''}`, image: DEFAULT_TF_ICON}
    if (dep.type === Tools.HELM) return {...dep, name: `${name} ${version || ''}`,image: DEFAULT_CHART_ICON}
    return dep
  })

  return (
    <Box pad='small'>
      <TreeGraph
        id={`${name}-tree`}
        tree={asDep({...resource, children: deps})}
        width='100%'
        height={GRAPH_HEIGHT} />
    </Box>
  )
}
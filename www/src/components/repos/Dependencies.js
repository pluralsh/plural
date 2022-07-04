import { memo } from 'react'
import { Box, Text } from 'grommet'
import { useQuery } from '@apollo/client'
import cloneDeep from 'lodash.clonedeep'
import groupBy from 'lodash.groupby'
import remove from 'lodash.remove'
import uniqueId from 'lodash.uniqueid'
import { Button } from 'honorable'

import TreeGraph from '../utils/TreeGraph'

import { DEFAULT_CHART_ICON, DEFAULT_TF_ICON, Tools } from './constants'
import { CLOSURE_Q } from './queries'

const GRAPH_HEIGHT = '500px'
const OPTIONAL_COLOR = '#fdc500'

function asDep({ __typename, name: depname, version, children }) {
  const name = `${depname} ${version || ''}`
  switch (__typename) {
    case 'Terraform':
      return { name, image: DEFAULT_TF_ICON, children }
    default:
      return { name, image: DEFAULT_CHART_ICON, children }
  }
}

function depType({ __typename }) {
  switch (__typename) {
    case 'Terraform':
      return Tools.TERRAFORM
    default:
      return Tools.HELM
  }
}

const key = ({ repo, name }) => `${repo}:${name}`

function mapify(deps) {
  const map = {}
  for (const dep of deps) {
    map[key(dep)] = true
  }

  return map
}

function closureDep({ helm, terraform, dep }, children) {
  const name = `${(helm || terraform).name} ${dep.version || ''}`
  const image = helm ? DEFAULT_CHART_ICON : DEFAULT_TF_ICON

  return { name, image, children, strokeColor: dep.optional ? OPTIONAL_COLOR : null }
}

function compileGraph(res, closure) {
  const resource = res.helm || res.terraform
  if (!resource.dependencies || !resource.dependencies.dependencies) return closureDep(res, [])

  const { dependencies: { dependencies } } = resource
  const isHelmDep = mapify(dependencies.filter(({ type }) => type === Tools.HELM))
  const isTfDep = mapify(dependencies.filter(({ type }) => type === Tools.TERRAFORM))

  const helmChildren = remove(closure.helm, ({ helm: { name, repository } }) => isHelmDep[`${repository.name}:${name}`])
  const terraformChildren = remove(closure.terraform, ({ terraform: { name, repository } }) => isTfDep[`${repository.name}:${name}`])
  const children = helmChildren.concat(terraformChildren).map(child => compileGraph(child, closure))

  return closureDep(res, children)
}

export function ShowFull({ onClick, label }) {
  return (
    <Button
      primary
      size="small"
      label={label}
      onClick={onClick}
    />
  )
}

export const FullDependencies = memo(({ resource }) => {
  const type = depType(resource)
  const { data, loading } = useQuery(CLOSURE_Q, {
    variables: { id: resource.id, type },
  })

  if (loading || !data) return null
  const closure = groupBy(data.closure, ({ helm }) => helm ? 'helm' : 'terraform')
  const graph = compileGraph({ [type.toLowerCase()]: resource, dep: {} }, cloneDeep(closure))

  return (
    <TreeGraph
      id={`${uniqueId('full_')}-full-tree`}
      tree={graph}
      width="100%"
      height={GRAPH_HEIGHT}
    />
  )
})

export default memo(({ name, dependencies, resource }) => {
  if (!dependencies || !dependencies.dependencies) {
    return (
      <Box pad="small">
        <Text size="small">No dependencies</Text>
      </Box>
    )
  }

  const deps = dependencies.dependencies.map(({ name, version, ...dep }) => {
    const strokeColor = dep.optional ? OPTIONAL_COLOR : null
    if (dep.type === Tools.TERRAFORM) return { ...dep, strokeColor, name: `${name} ${version || ''}`, image: DEFAULT_TF_ICON }
    if (dep.type === Tools.HELM) return { ...dep, strokeColor, name: `${name} ${version || ''}`, image: DEFAULT_CHART_ICON }

    return dep
  })

  return (
    <TreeGraph
      id={`${uniqueId(name)}-tree`}
      tree={asDep({ ...resource, children: deps })}
      width="100%"
      height={GRAPH_HEIGHT}
    />
  )
})

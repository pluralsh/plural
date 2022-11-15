import { memo, useRef, useState } from 'react'
import { Box, Text } from 'grommet'
import { useQuery } from '@apollo/client'
import cloneDeep from 'lodash/cloneDeep'
import groupBy from 'lodash/groupBy'
import remove from 'lodash/remove'
import uniqueId from 'lodash/uniqueId'
import { useOutletContext } from 'react-router-dom'
import {
  PageTitle,
  SubTab,
  TabList,
  TabPanel,
} from '@pluralsh/design-system'
import { Flex } from 'honorable'

import TreeGraph from '../../utils/TreeGraph'

import { DEFAULT_CHART_ICON, DEFAULT_TF_ICON, Tools } from '../constants'
import { CLOSURE_Q } from '../queries'

import { PackageActions } from './misc'

const GRAPH_HEIGHT = '400px'
const OPTIONAL_COLOR = '#9095A2'
const OPTIONAL_DASHARRAY = '2'
const LEGEND = {
  Required: { color: '#fff', dasharray: '0' },
  Optional: { color: OPTIONAL_COLOR, dasharray: OPTIONAL_DASHARRAY },
}

function asDep({
  __typename, name: depname, version, children,
}: any) {
  const name = `${depname} ${version || ''}`

  switch (__typename) {
  case 'Terraform':
    return { name, image: DEFAULT_TF_ICON, children }
  default:
    return { name, image: DEFAULT_CHART_ICON, children }
  }
}

function depType({ __typename }: any) {
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
  const strokeColor = dep.optional ? OPTIONAL_COLOR : null
  const strokeDasharray = dep.optional ? OPTIONAL_DASHARRAY : null

  return {
    name, image, children, strokeColor, strokeDasharray,
  }
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

const FullDependencies = memo(({ resource }: any) => {
  const type = depType(resource)
  const { data, loading } = useQuery(CLOSURE_Q, {
    variables: { id: resource.id, type },
  })

  if (loading || !data) return null
  const closure = groupBy(data.closure, ({ helm }) => (helm ? 'helm' : 'terraform'))
  const graph = compileGraph({ [type.toLowerCase()]: resource, dep: {} }, cloneDeep(closure))

  return (
    <TreeGraph
      id={`${uniqueId('full_')}-full-tree`}
      tree={graph}
      height={GRAPH_HEIGHT}
      legend={LEGEND}
    />
  )
})

const Dependencies = memo(({ name, dependencies, resource }: any) => {
  if (!dependencies || !dependencies.dependencies) {
    return (
      <Box pad="small">
        <Text size="small">No dependencies</Text>
      </Box>
    )
  }

  const deps = dependencies.dependencies.map(({ name, version, ...dep }) => {
    const strokeColor = dep.optional ? OPTIONAL_COLOR : null
    const strokeDasharray = dep.optional ? OPTIONAL_DASHARRAY : null

    if (dep.type === Tools.TERRAFORM) {
      return {
        ...dep, strokeColor, strokeDasharray, name: `${name} ${version || ''}`, image: DEFAULT_TF_ICON,
      }
    }
    if (dep.type === Tools.HELM) {
      return {
        ...dep, strokeColor, strokeDasharray, name: `${name} ${version || ''}`, image: DEFAULT_CHART_ICON,
      }
    }

    return dep
  })

  return (
    <TreeGraph
      id={`${uniqueId(name)}-tree`}
      tree={asDep({ ...resource, children: deps })}
      height={GRAPH_HEIGHT}
      legend={LEGEND}
    />
  )
})

const DIRECTORY = [
  { key: 'immediate', label: 'Immediate' },
  { key: 'full', label: 'Full' },
]

export default function PackageDependencies() {
  const {
    helmChart, terraformChart, currentHelmChart, currentTerraformChart,
  } = useOutletContext() as any
  const chart = helmChart || terraformChart
  const current = currentHelmChart || currentTerraformChart
  const [full, setFull] = useState(false)

  const tabStateRef = useRef<any>(null)
  const selectedTabKey = full ? 'full' : 'immediate'

  return (
    <Box
      fill
      gap="small"
    >
      <PageTitle heading="Dependencies">
        <Flex display-desktop-up="none"><PackageActions /></Flex>
      </PageTitle>
      <TabPanel
        stateRef={tabStateRef}
        as={(
          <Box
            pad={{ right: 'small' }}
            overflow={{ vertical: 'auto' }}
          />
        )}
      >
        <TabList
          stateRef={tabStateRef}
          stateProps={{
            orientation: 'horizontal',
            selectedKey: selectedTabKey,
            onSelectionChange: key => setFull(key === 'full'),
          }}
          marginBottom="small"
        >
          {DIRECTORY.map(({ label, key }) => (
            <SubTab
              key={key}
              textValue={label}
            >
              {label}
            </SubTab>
          ))}
        </TabList>
        {full && <FullDependencies resource={chart} />}
        {!full && (
          <Dependencies
            name={chart.name}
            resource={chart}
            dependencies={(current || chart).dependencies}
          />
        )}
      </TabPanel>
    </Box>
  )
}

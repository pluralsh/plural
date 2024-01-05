import { memo, useMemo, useRef, useState } from 'react'
import { Box, Text } from 'grommet'
import { useQuery } from '@apollo/client'
import cloneDeep from 'lodash/cloneDeep'
import groupBy from 'lodash/groupBy'
import remove from 'lodash/remove'
import { useOutletContext } from 'react-router-dom'
import { PageTitle, SubTab, TabList, TabPanel } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import TreeGraph from '../../../utils/TreeGraph'
import { CLOSURE_Q } from '../queries'
import { DEFAULT_CHART_ICON, DEFAULT_TF_ICON, Tools } from '../../../constants'
import { PackageActions } from '../misc'

const GRAPH_HEIGHT = '400px'
const OPTIONAL_DASHARRAY = '2'

const useLegendColors = () => {
  const theme = useTheme()

  return useMemo(
    () => ({
      optional: theme.colors.text,
      required: theme.colors['text-light'],
    }),
    [theme]
  )
}

const useLegend = () => {
  const legendColors = useLegendColors()
  return useMemo(
    () => ({
      Required: { color: legendColors.required, dasharray: '0' },
      Optional: { color: legendColors.optional, dasharray: OPTIONAL_DASHARRAY },
    }),
    [legendColors]
  )
}

function asDep({ __typename, name: depname, version, children }: any) {
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

function closureDep({ helm, terraform, dep }, children, legendColors) {
  const name = `${(helm || terraform).name} ${dep.version || ''}`
  const image = helm ? DEFAULT_CHART_ICON : DEFAULT_TF_ICON
  const strokeColor = dep.optional
    ? legendColors.optional
    : legendColors.required
  const strokeDasharray = dep.optional ? OPTIONAL_DASHARRAY : null

  return {
    name,
    image,
    children,
    strokeColor,
    strokeDasharray,
  }
}

function compileGraph(res, closure, legendColors) {
  const resource = res.helm || res.terraform

  if (!resource.dependencies || !resource.dependencies.dependencies)
    return closureDep(res, [], legendColors)

  const {
    dependencies: { dependencies },
  } = resource
  const isHelmDep = mapify(
    dependencies.filter(({ type }) => type === Tools.HELM)
  )
  const isTfDep = mapify(
    dependencies.filter(({ type }) => type === Tools.TERRAFORM)
  )

  const helmChildren = remove(
    closure.helm,
    ({ helm: { name, repository } }) => isHelmDep[`${repository.name}:${name}`]
  )
  const terraformChildren = remove(
    closure.terraform,
    ({ terraform: { name, repository } }) =>
      isTfDep[`${repository.name}:${name}`]
  )
  const children = helmChildren
    .concat(terraformChildren)
    .map((child) => compileGraph(child, closure, legendColors))

  return closureDep(res, children, legendColors)
}

const FullDependencies = memo(({ resource }: any) => {
  const legendColors = useLegendColors()
  const legend = useLegend()
  const type = depType(resource)
  const { data, loading } = useQuery(CLOSURE_Q, {
    variables: { id: resource.id, type },
  })

  const graph = useMemo(() => {
    if (loading || !data) return null
    const closure = groupBy(data.closure, ({ helm }) =>
      helm ? 'helm' : 'terraform'
    )

    return compileGraph(
      { [type.toLowerCase()]: resource, dep: {} },
      cloneDeep(closure),
      legendColors
    )
  }, [legendColors, data, loading, resource, type])

  if (!graph) return null

  return (
    <TreeGraph
      tree={graph}
      height={GRAPH_HEIGHT}
      legend={legend}
    />
  )
})

const Dependencies = memo(({ dependencies, resource }: any) => {
  const legend = useLegend()
  const legendColors = useLegendColors()

  const tree = useMemo(() => {
    const deps = dependencies?.dependencies?.map(
      ({ name, version, ...dep }) => {
        const strokeColor = dep.optional
          ? legendColors.optional
          : legendColors.required
        const strokeDasharray = dep.optional ? OPTIONAL_DASHARRAY : null

        if (dep.type === Tools.TERRAFORM) {
          return {
            ...dep,
            strokeColor,
            strokeDasharray,
            name: `${name} ${version || ''}`,
            image: DEFAULT_TF_ICON,
          }
        }
        if (dep.type === Tools.HELM) {
          return {
            ...dep,
            strokeColor,
            strokeDasharray,
            name: `${name} ${version || ''}`,
            image: DEFAULT_CHART_ICON,
          }
        }

        return dep
      }
    )
    if (!deps) {
      return null
    }

    return asDep({ ...resource, children: deps })
  }, [dependencies, legendColors, resource])

  if (!tree) {
    return (
      <Box pad="small">
        <Text size="small">No dependencies</Text>
      </Box>
    )
  }

  return (
    <TreeGraph
      tree={tree}
      height={GRAPH_HEIGHT}
      legend={legend}
    />
  )
})

const DIRECTORY = [
  { key: 'immediate', label: 'Immediate' },
  { key: 'full', label: 'Full' },
]

export default function PackageDependencies() {
  const theme = useTheme()
  const { helmChart, terraformChart, currentHelmChart, currentTerraformChart } =
    useOutletContext() as any
  const chart = helmChart || terraformChart
  const current = currentHelmChart || currentTerraformChart
  const [full, setFull] = useState(false)

  const tabStateRef = useRef<any>(null)
  const selectedTabKey = full ? 'full' : 'immediate'

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <PageTitle heading="Dependencies">
        <PackageActions />
      </PageTitle>
      <TabList
        stateRef={tabStateRef}
        stateProps={{
          orientation: 'horizontal',
          selectedKey: selectedTabKey,
          onSelectionChange: (key) => setFull(key === 'full'),
        }}
        css={{
          marginBottom: theme.spacing.small,
        }}
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
      <TabPanel
        stateRef={tabStateRef}
        css={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {full && <FullDependencies resource={chart} />}
        {!full && (
          <Dependencies
            resource={chart}
            dependencies={(current || chart).dependencies}
          />
        )}
      </TabPanel>
    </div>
  )
}

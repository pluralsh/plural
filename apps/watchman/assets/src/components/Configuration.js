import React, { useContext, useEffect, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useQuery, useMutation } from 'react-apollo'
import { CONFIGURATIONS_Q, UPDATE_CONFIGURATION } from './graphql/forge'
import { Loading, Button, Scroller } from 'forge-core'
import { Box, Text } from 'grommet'
import { BreadcrumbsContext } from './Breadcrumbs'
import { BUILD_PADDING } from './Builds'
import { FormNext } from 'grommet-icons'
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-yaml"
import "ace-builds/src-noconflict/theme-terminal"
import { chunk } from '../utils/array'

export function EditConfiguration({repository: {name, configuration, icon, description}}) {
  const [config, setConfig] = useState(configuration)
  const [mutation, {loading}] = useMutation(UPDATE_CONFIGURATION, {
    variables: {repository: name, content: config},
    update: (cache, {data: {updateConfiguration: {configuration}}}) => {
      const {installations, prev} = cache.readQuery({query: CONFIGURATIONS_Q})
      const updateEdge = (edge) => ({
        ...edge,
        node: {...edge.node, repository: {...edge.node.repository, configuration}}
      })

      cache.writeQuery({
        query: CONFIGURATIONS_Q,
        data: {
          ...prev, installations: {
            ...installations, edges: installations.edges.map((edge) => (
              edge.node.repository.name === name ? updateEdge(edge) : edge
            ))
          }
        }
      })
    }
  })

  return (
    <Box height='calc(100vh - 45px)'>
      <Box gap='small'>
        <Box
          pad={{vertical: 'small', ...BUILD_PADDING}}
          direction='row'
          align='center'
          background='backgroundColor'
          height='60px'>
          <Box direction='row' fill='horizontal' gap='small' align='center'>
            {icon && <img alt='' src={icon} height='40px' width='40px' />}
            <Text weight='bold' size='small'>Edit {name}</Text>
          </Box>
          <Box flex={false}>
            <Button label='Commit' onClick={mutation} loading={loading} />
          </Box>
        </Box>
      </Box>
      <AceEditor
        mode='yaml'
        theme='terminal'
        height='calc(100vh - 105px)'
        width='100%'
        name={name}
        value={config}
        showGutter
        showPrintMargin
        highlightActiveLine
        editorProps={{ $blockScrolling: true }}
        onChange={setConfig} />
    </Box>
  )
}

export function RepositoryChoice({config: {name, icon, description}, link}) {
  let history = useHistory()

  return (
    <Box
      onClick={() => history.push(link)}
      width='50%'
      hoverIndicator='backgroundDark'
      background='cardDetailLight'
      direction='row'
      align='center'
      justify='center'
      round='xsmall'
      pad='medium'>
      <Box direction='row' fill='horizontal' gap='small' align='center'>
        {icon && <img alt='' src={icon} height='40px' width='40px' />}
        <Box>
          <Text size='small' style={{fontWeight: 500}}>{name}</Text>
          <Text size='small' color='dark-6'>{description}</Text>
        </Box>
      </Box>
      <Box flex={false}>
        <FormNext size='25px' />
      </Box>
    </Box>
  )
}

export default function Configuration() {
  const {repo} = useParams()
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  const {data} = useQuery(CONFIGURATIONS_Q, {fetchPolicy: 'cache-and-network'})
  useEffect(() => {
    const additional = repo ? [{text: repo, url: `/config/${repo}`}] : []
    setBreadcrumbs([{text: 'configuration', url: '/config'}, ...additional])
  }, [repo])

  if (!data) return <Loading />
  const {edges} = data.installations
  const selected = edges.find(({node: {repository: {name}}}) => name === repo)
  if (repo && selected) {
    return <EditConfiguration repository={selected.node.repository} />
  }

  return (
    <Box height='calc(100vh - 45px)'>
      <Box gap='small' background='backgroundColor'>
        <Box
          pad={{vertical: 'small', ...BUILD_PADDING}} direction='row' align='center' height='60px'>
          <Box fill='horizontal' pad={{horizontal: 'small'}}>
            <Text weight='bold' size='small'>Configuration</Text>
            <Text size='small' color='dark-6'>edit configuration for your installed repos</Text>
          </Box>
        </Box>
      </Box>
      <Box height='calc(100vh - 105px)' background='backgroundColor' pad='small'>
        <Scroller
          id='configuration'
          style={{height: '100%', overflow: 'auto'}}
          edges={[...chunk(edges, 2)]}
          mapper={(chunk) => (
            <Box direction='row' height='100px' gap='small' margin={{bottom: 'small'}}>
               {chunk.map(({node: {repository}}) => (
                  <RepositoryChoice
                    key={repository.id}
                    link={`/config/${repository.name}`}
                    config={repository} />))}
            </Box>
          )} />
      </Box>
    </Box>
  )
}
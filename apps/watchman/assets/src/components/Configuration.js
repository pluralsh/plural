import React, { useContext, useEffect, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useQuery, useMutation } from 'react-apollo'
import { CONFIGURATIONS_Q, UPDATE_CONFIGURATION } from './graphql/chartmart'
import Loading from './utils/Loading'
import Button from './utils/Button'
import { Box, Text } from 'grommet'
import { BreadcrumbsContext } from './Breadcrumbs'
import Scroller from './utils/Scroller'
import { BUILD_PADDING } from './Builds'
import { FormNext } from 'grommet-icons'
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-yaml"
import "ace-builds/src-noconflict/theme-terminal"

export function EditConfiguration({repository: {name, configuration}}) {
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
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
  useEffect(() => setBreadcrumbs([
    {text: 'configuration', url: '/config'},
    {text: name, url: `/config/${name}`}
  ]), [])

  return (
    <Box height='calc(100vh - 45px)'>
      <Box gap='small'>
        <Box
          pad={{vertical: 'small', ...BUILD_PADDING}}
          direction='row'
          align='center'
          border='bottom'
          height='60px'>
          <Box fill='horizontal' pad={{horizontal: 'small'}}>
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

function Config({config, next}) {
  let history = useHistory()
  console.log(next)
  return (
    <Box
      onClick={() => history.push(`/config/${config.name}`)}
      direction='row'
      pad={{vertical: 'small', ...BUILD_PADDING}}
      border={next.node ? 'bottom' : null}>
      <Box fill='horizontal'>
        <Text size='small' style={{fontWeight: 500}}>{config.name}</Text>
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
  const {data} = useQuery(CONFIGURATIONS_Q)
  useEffect(() => setBreadcrumbs([{text: 'configuration', url: '/config'}]), [])

  if (!data) return <Loading />
  const {edges} = data.installations
  const selected = edges.find(({node: {repository: {name}}}) => name === repo)
  if (repo && selected) {
    return <EditConfiguration repository={selected.node.repository} />
  }

  return (
    <Box height='calc(100vh - 45px)' pad={{bottom: 'small'}}>
      <Box gap='small'>
        <Box
          pad={{vertical: 'small', ...BUILD_PADDING}}
          direction='row'
          align='center'
          border='bottom'
          height='60px'>
          <Box fill='horizontal' pad={{horizontal: 'small'}}>
            <Text weight='bold' size='small'>Configuration</Text>
            <Text size='small' color='dark-3'>edit configuration for your installed repos</Text>
          </Box>
        </Box>
      </Box>
      <Box height='calc(100vh - 105px)'>
        <Scroller
          id='configuration'
          style={{height: '100%', overflow: 'auto'}}
          edges={edges}
          mapper={({node: {repository}}, next) => <Config key={repository.id} config={repository} next={next} />} />
      </Box>
    </Box>
  )
}
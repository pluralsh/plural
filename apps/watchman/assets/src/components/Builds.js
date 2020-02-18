import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { useQuery, useMutation } from 'react-apollo'
import { BUILDS_Q, CREATE_BUILD, BUILD_SUB } from './graphql/builds'
import Loading from './utils/Loading'
import { Box, Text, FormField, TextInput, Select } from 'grommet'
import moment from 'moment'
import Button from './utils/Button'
import Scroller from './utils/Scroller'
import Modal, { ModalHeader } from './utils/Modal'
import { mergeEdges } from './graphql/utils'
import { BeatLoader } from 'react-spinners'
import { BreadcrumbsContext } from './Breadcrumbs'
import { INSTALLATION_Q } from './graphql/chartmart'

function BuildStatusInner({background, text, icon}) {
  return (
    <Box
      direction='row'
      align='center'
      pad={{horizontal: 'small', vertical: 'xsmall'}}
      round='xsmall'
      background={background}>
      {icon && <Box width='50px'>{icon}</Box>}
      <Text size='small' color='white'>{text}</Text>
    </Box>
  )
}

function BuildStatus({status}) {
  switch (status) {
    case "QUEUED":
      return <BuildStatusInner background='status-unknown' text='queued' />
    case "RUNNING":
      return <BuildStatusInner icon={<BeatLoader size={5} margin={2} color='white' />} background='progress' text='running' />
    case "FAILED":
      return <BuildStatusInner background='error' text='failed' />
    case "SUCCESSFUL":
      return <BuildStatusInner background='success' text='successful' />
    default:
      return null
  }
}

export const BUILD_PADDING = {horizontal: 'medium'}

function Build({build: {id, repository, status, insertedAt, message}}) {
  let history = useHistory()
  const [hover, setHover] = useState(false)
  return (
    <Box pad={BUILD_PADDING}>
      <Box
        border
        pad='small'
        margin={{bottom: 'small'}}
        direction='row'
        align='center'
        round='xsmall'
        style={{cursor: 'pointer'}}
        onClick={() => history.push(`/build/${id}`)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        background={hover ? 'light-3' : null}>
        <Box fill='horizontal'>
          <Text size='small' weight='bold'>{repository}</Text>
          <Text size='small' color='dark-3'>{moment(insertedAt).fromNow()} {message && `-- ${message}`}</Text>
        </Box>
        <BuildStatus status={status} />
      </Box>
    </Box>
  )
}

function BuildForm({setOpen}) {
  const [attributes, setAttributes] = useState({repository: '', type: 'DEPLOY', message: "manual test"})
  const [mutation, {loading}] = useMutation(CREATE_BUILD, {
    variables: {attributes},
    fetchPolicy: 'no-cache',
    onCompleted: () => setOpen(false)
  })
  const {data} = useQuery(INSTALLATION_Q, {
    onCompleted: ({installations: {edges}}) => {
      setAttributes({...attributes, repository: edges[0].node.repository.name})
    }
  })
  if (!data) return <Loading />
  const {edges} = data.installations

  return (
    <Box gap='small' pad='medium'>
      <FormField label='repository'>
        <Select
          options={edges.map(({node: {repository: {name}}}) => name)}
          value={attributes.repository}
          onChange={({value}) => setAttributes({...attributes, repository: value})} />
      </FormField>
      <FormField label='message'>
        <TextInput
          placeholder='manual test'
          value={attributes.message}
          onChange={({target: {value}}) => setAttributes({...attributes, message: value})} />
      </FormField>
      <FormField label='type'>
        <Select
          options={[{display: 'deploy', type: 'DEPLOY'}, {display: 'bounce', type: 'BOUNCE'}]}
          value={attributes.type.toLowerCase()}
          valueKey={'display'}
          onChange={({value: {type}}) => setAttributes({...attributes, type})}>
          {({display}) => <Box pad='small'><Text size='small'>{display}</Text></Box>}
        </Select>
      </FormField>
      <Box direction='row' justify='end' align='center'>
        <Button loading={loading} label='Create' round='xsmall' onClick={mutation} />
      </Box>
    </Box>
  )
}

function CreateBuild() {
  return (
    <Modal target={
      <Box pad={{horizontal: 'small'}}>
        <Button round='xsmall' pad={{horizontal: 'medium', vertical: 'xsmall'}} label='Create' />
      </Box>
    }>
    {setOpen => (
      <Box width='40vw'>
        <ModalHeader text='Create a build' setOpen={setOpen} />
        <BuildForm setOpen={setOpen} />
      </Box>
    )}
    </Modal>
  )
}

function applyDelta({builds: {edges, ...rest}, ...prev}, {delta, payload}) {
  return {
    ...prev,
    builds: {...rest, edges: mergeEdges(edges, delta, payload, "BuildEdge")}
  }
}

export default function Builds() {
  const {data, loading, subscribeToMore, fetchMore} = useQuery(BUILDS_Q, {fetchPolicy: 'cache-and-network'})
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => setBreadcrumbs([{text: 'builds', url: '/'}]), [])
  useEffect(() => subscribeToMore({
    document: BUILD_SUB,
    updateQuery: (prev, {subscriptionData: {data}}) => {
      console.log(data)
      return data ? applyDelta(prev, data.buildDelta) : prev
  }}), [])

  if (loading && !data) return <Loading />

  const {edges, pageInfo} = data.builds
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
            <Text weight='bold' size='small'>Builds</Text>
            <Text size='small' color='dark-3'>a list of historical changes managed by watchman</Text>
          </Box>
          <CreateBuild />
        </Box>
        <Box height='calc(100vh - 105px)'>
          <Scroller
            id='builds'
            style={{height: '100%', overflow: 'auto'}}
            edges={edges}
            mapper={({node}) => <Build key={node.id} build={node} />}
            onLoadMore={() => pageInfo.hasNextPage && fetchMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: (prev, {fetchMoreResult: {builds}}) => {
                return {...prev, builds: {
                  ...prev.builds, pageInfo: builds.pageInfo, edges: [...edges, ...builds.edges]
                }}
              }
            })} />
        </Box>
      </Box>
    </Box>
  )
}
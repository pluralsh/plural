import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { useQuery, useMutation } from 'react-apollo'
import { BUILDS_Q, CREATE_BUILD, BUILD_SUB } from './graphql/builds'
import Loading from './utils/Loading'
import { Box, Text, FormField, TextInput, Select } from 'grommet'
import moment from 'moment'
import Button from './utils/Button'
import Modal, { ModalHeader } from './utils/Modal'
import ScrollableContainer from './utils/ScrollableContainer'
import { mergeEdges, appendEdge } from './graphql/utils'
import { BeatLoader } from 'react-spinners'
import { BreadcrumbsContext } from './Breadcrumbs'

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

function Build({build: {id, repository, status, insertedAt}}) {
  let history = useHistory()
  const [hover, setHover] = useState(false)
  return (
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
        <Text size='small' color='dark-3'>{moment(insertedAt).fromNow()}</Text>
      </Box>
      <BuildStatus status={status} />
    </Box>
  )
}

function BuildForm({setOpen}) {
  const [attributes, setAttributes] = useState({repository: '', type: 'DEPLOY'})
  const [mutation, {loading}] = useMutation(CREATE_BUILD, {
    variables: {attributes},
    update: (cache, {data: {createBuild}}) => {
      const {builds: {pageInfo, edges, ...rest}, ...prev} = cache.readQuery({ query: BUILDS_Q })
      cache.writeQuery({
        query: BUILDS_Q,
        data: {...prev, builds: {
            ...rest, pageInfo, edges: appendEdge(edges, createBuild, 'BuildEdge')
          }
        }
      })
      setOpen(false)
    }
  })
  return (
    <Box gap='small' pad='medium'>
      <FormField label='repository'>
        <TextInput
          placeholder='chartmart'
          value={attributes.repository}
          onChange={({target: {value}}) => setAttributes({...attributes, repository: value})} />
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
      <Button round='xsmall' label='Create' />
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
  const {data, loading, subscribeToMore} = useQuery(BUILDS_Q, {fetchPolicy: 'cache-and-network'})
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => setBreadcrumbs([{text: 'builds', url: '/'}]), [])
  useEffect(() => subscribeToMore({
    document: BUILD_SUB,
    updateQuery: (prev, {subscriptionData: {data}}) => {
      return data ? applyDelta(prev, data.buildDelta) : prev
  }}), [subscribeToMore])

  if (loading || !data) return <Loading />

  const {edges} = data.builds
  return (
    <Box height='calc(100vh - 45px)' pad={{bottom: 'small'}}>
      <ScrollableContainer>
        <Box gap='small' pad={{horizontal: 'medium'}}>
          <Box pad='small' direction='row' align='center' border='bottom' height='60px'>
            <Box fill='horizontal'>
              <Text weight='bold'>Builds</Text>
            </Box>
            <CreateBuild />
          </Box>
          <Box>
            {edges.map(({node}) => <Build key={node.id} build={node} />)}
          </Box>
        </Box>
      </ScrollableContainer>
    </Box>
  )
}
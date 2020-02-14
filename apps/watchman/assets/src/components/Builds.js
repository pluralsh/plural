import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { BUILDS_Q, CREATE_BUILD } from './graphql/builds'
import Loading from './utils/Loading'
import { Box, Text, FormField, TextInput, Select } from 'grommet'
import moment from 'moment'
import Button from './utils/Button'
import Modal, { ModalHeader } from './utils/Modal'

function BuildStatusInner({background, text}) {
  return (
    <Box pad={{horizontal: 'small', vertical: 'xsmall'}} round='xsmall' background={background}>
      <Text size='small'>{text}</Text>
    </Box>
  )
}

function BuildStatus({status}) {
  switch (status) {
    case "QUEUED":
      return <BuildStatusInner background='status-unknown' text='queued' />
    case "RUNNING":
      return <BuildStatusInner background='progress' text='running' />
    case "FAILED":
      return <BuildStatusInner background='status-error' text='failed' />
    case "SUCCESSFUL":
      return <BuildStatusInner background='status-ok' text='successful' />
    default:
      return null
  }
}

function Build({build: {repository, status, insertedAt}}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      border
      pad='small'
      direction='row'
      align='center'
      round='xsmall'
      style={{cursor: 'pointer'}}
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
            ...rest, pageInfo, edges: [{__typename: 'BuildEdge', node: createBuild}, ...edges]
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

export default function Builds() {
  const {data, loading} = useQuery(BUILDS_Q, {pollInterval: 5000})

  if (loading || !data) return <Loading />

  const {edges} = data.builds
  return (
    <Box gap='small' pad={{horizontal: 'medium'}}>
      <Box pad='small' direction='row' align='center' border='bottom'>
        <Box fill='horizontal'>
          <Text weight='bold'>Builds</Text>
        </Box>
        <CreateBuild />
      </Box>
      {edges.map(({node}) => <Build key={node.id} build={node} />)}
    </Box>
  )
}
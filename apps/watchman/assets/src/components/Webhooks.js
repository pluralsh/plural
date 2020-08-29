import React, { useContext, useEffect, useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { BreadcrumbsContext } from './Breadcrumbs'
import { WEBHOOKS_Q, CREATE_WEBHOOK } from './graphql/webhooks'
import { Loading, Button, Scroller, Modal, ModalHeader } from 'forge-core'
import { BUILD_PADDING } from './Builds'
import { Box, Text, FormField, TextInput, Layer } from 'grommet'
import { chunk } from '../utils/array'

const MAX_LEN = 60
const trim = (url) => url.length > 10 ? `${url.slice(0, MAX_LEN)}...` : url

function WebhookHealth({health}) {
  const background = health === "HEALTHY" ? 'success' : 'error'
  return (
    <Box
      background={background}
      justify='center'
      align='center'
      round='xsmall'
      pad={{horizontal: 'medium', vertical: 'xsmall'}}>
      <Text size='small'>{health.toLowerCase()}</Text>
    </Box>
  )
}

function Webhook({webhook: {url, health}}) {
  return (
    <Box
      margin={{bottom: 'small', ...BUILD_PADDING}}
      background='cardDetailLight'
      width='50%'
      pad='small'
      align='center'
      round='xsmall'
      direction='row'>
      <Box fill='horizontal'>
        <Text size='small'>{trim(url)}</Text>
      </Box>
      <Box flex={false}>
        <WebhookHealth health={health} />
      </Box>
    </Box>
  )
}

function WebhookForm({onSubmit}) {
  const [attributes, setAttributes] = useState({url: ''})
  const [mutation, {loading}] = useMutation(CREATE_WEBHOOK, {
    variables: {attributes},
    update: (cache, {data: {createWebhook}}) => {
      const {webhooks, ...prev} = cache.readQuery({query: WEBHOOKS_Q})
      cache.writeQuery({
        query: WEBHOOKS_Q,
        data: {...prev, webhooks: {...webhooks,
          edges: [{__typename: "WebhookEdge", node: createWebhook}, ...webhooks.edges]
        }}
      })
      onSubmit && onSubmit()
    }
  })

  return (
    <Box pad='medium' gap='small'>
      <FormField label='url'>
        <TextInput
          placeholder='https://my.piazza.instance/incoming_webhooks/id'
          value={attributes.url}
          onChange={({target: {value}}) => setAttributes({...attributes, url: value})} />
      </FormField>
      <Box direction='row' align='center' justify='end'>
        <Button label='Create' onClick={mutation} loading={loading} />
      </Box>
    </Box>
  )
}

function CreateWebhook() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Box pad={{horizontal: 'small'}}>
        <Button
          onClick={() => setOpen(true)}
          flat
          round='xsmall'
          pad={{horizontal: 'medium', vertical: 'xsmall'}}
          label='Create'
        />
      </Box>
    {open && (
      <Layer modal>
        <Box width='50vw'>
          <ModalHeader text='Create webhook' setOpen={setOpen} />
          <WebhookForm onSubmit={() => setOpen(false)} />
        </Box>
      </Layer>
    )}
    </>
  )
}

export default function Webhooks() {
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => setBreadcrumbs([{text: 'webhooks', url: '/webhooks'}]), [])
  const {data, fetchMore} = useQuery(WEBHOOKS_Q)

  if (!data) return <Loading />
  const {edges, pageInfo} = data.webhooks

  return (
    <Box height='calc(100vh - 45px)'>
      <Box>
        <Box
          pad={{vertical: 'small', ...BUILD_PADDING}}
          direction='row'
          align='center'
          border='bottom'
          background='backgroundColor'
          height='60px'>
          <Box fill='horizontal' pad={{horizontal: 'small'}}>
            <Text weight='bold' size='small'>Webhooks</Text>
            <Text size='small' color='dark-3'>will notify other tools of build success/failure</Text>
          </Box>
          <CreateWebhook />
        </Box>
        <Box height='calc(100vh - 105px)' background='backgroundColor' pad={{vertical: 'small'}}>
          <Scroller
            id='webhooks'
            style={{height: '100%', overflow: 'auto'}}
            edges={Array.from(chunk(edges, 2))}
            mapper={(chunk) => (
              <Box key={chunk[0].node.id} direction='row' gap='small'>
                {chunk.map(({node}) => <Webhook key={node.id} webhook={node} />)}
              </Box>
            )}
            onLoadMore={() => pageInfo.hasNextPage && fetchMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: (prev, {fetchMoreResult: {webhooks}}) => {
                return {...prev, webhooks: {
                  ...prev.webhooks, pageInfo: webhooks.pageInfo,
                  edges: [...prev.webhooks.edges, ...webhooks.edges]
                }}
              }
            })} />
        </Box>
      </Box>
    </Box>
  )
}
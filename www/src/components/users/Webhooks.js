import React, {useState} from 'react'
import {Box, Text, Layer} from 'grommet'
import {Refresh} from 'grommet-icons'
import {useQuery, useMutation} from 'react-apollo'
import { WEBHOOKS_Q, PING_WEBHOOK} from './queries'
import Scroller from '../utils/Scroller'
import {ModalHeader} from '../utils/Modal'
import Button from '../utils/Button'
import Copyable from '../utils/Copyable'
import InputField from '../utils/InputField'
import moment from 'moment'


const LABEL_WIDTH = '60px'
const CELL_WIDTH='200px'

function WebhookResult({statusCode, body}) {
  const status = statusCode >= 200 && statusCode < 300 ? 'status-ok' : 'status-error'
  return (
    <Box gap='small' border='top' pad={{top: 'small'}}>
      <Box direction='row' gap='small' align='center'>
        <Text weight='bold' size='small'>Status Code: </Text>
        <Box background={status} round='xsmall' pad={{vertical: 'xxsmall', horizontal: 'xsmall'}}>
          <Text size='small' >{statusCode}</Text>
        </Box>
      </Box>
      <Box direction='row' align='center' gap='small'>
        <Text size='small' weight='bold'>Body</Text>
        <Box background='light-2' pad='small'>{body}</Box>
      </Box>
    </Box>
  )
}

function PingWebhook({id}) {
  const [open, setOpen] = useState(false)
  const [repo, setRepo] = useState(null)
  const [mutation, {data}] = useMutation(PING_WEBHOOK, {variables: {repo, id}})
  const pinged = data && data.pingWebhook

  return (
    <>
    <Refresh size='18px' onClick={() => setOpen(true)} />
    {open && (
      <Layer
        modal
        position='center'
        onClickOutside={() => setOpen(false)}
        onEsc={() => setOpen(false)} >
        <Box width='30vw'>
          <ModalHeader text='Ping Webhook' setOpen={setOpen} />
          <Box pad='medium' gap='small'>
            <InputField
              label='repo'
              placeholder='enter a repo name'
              labelWidth={LABEL_WIDTH}
              value={repo}
              onChange={({target: {value}}) => setRepo(value)} />
            <Box direction='row' justify='end'>
              <Button round='xsmall' label='Update' onClick={mutation} />
            </Box>
            {pinged && (<WebhookResult {...pinged} />)}
          </Box>
        </Box>
      </Layer>
    )}
    </>
  )
}

function Webhook({webhook: {url, insertedAt, id, secret}, hasNext}) {
  const [hover, setHover] = useState(false)

  return (
    <Box
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      background={hover ? 'light-2' : null}
      border={hasNext ? 'bottom' : null}
      direction='row' pad={{vertical: 'xsmall', horizontal: 'small'}}>
      <Box width='100%' justify='center' gap='xxsmall'>
        <Text size='small'>{url}</Text>
        <Copyable
          noBorder
          pillText='Copied webhook secret'
          text={secret}
          displayText={secret.substring(0, 9) + "x".repeat(15)} />
      </Box>
      <Box width={CELL_WIDTH} pad='xsmall' direction='row' gap='medium' align='center' justify='end'>
        <Text size='small'>{moment(insertedAt).fromNow()}</Text>
        <PingWebhook id={id} />
      </Box>
    </Box>
  )
}

function NoWebhooks() {
  return (
    <Box pad='small'>
      <Text size='small'>No webhooks</Text>
    </Box>
  )
}

export default function Webhooks() {
  const {data, loading, fetchMore} = useQuery(WEBHOOKS_Q)
  if (!data || loading) return null
  const {edges, pageInfo} = data.webhooks
  return (
    <Box border>
      <Box
        direction='row'
        background='light-3'
        border='bottom'
        align='center'
        elevation='xsmall'
        pad={{vertical: 'xsmall', horizontal: 'small'}}>
        <Text size='small' style={{fontWeight: 500}}>Webhooks</Text>
      </Box>
      <Box>
        <Scroller
          id='webhooks'
          edges={edges}
          emptyState={<NoWebhooks />}
          style={{overflow: 'auto', height: '100%', width: '100%'}}
          mapper={({node}, next) => (
            <Webhook
              key={node.id}
              webhook={node}
              hasNext={!!next.node} />
          )}
          onLoadMore={() => {
            if (!pageInfo.hasNextPage) return

            fetchMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: (prev, {fetchMoreResult}) => {
                const {edges, pageInfo} = fetchMoreResult.webhooks
                return edges.length ? {
                  ...prev,
                  webhooks: {
                    ...prev.webhooks,
                    pageInfo,
                    edges: [...prev.webhooks.edges, ...edges]
                  }
                } : prev
              }
            })
          }}
        />
      </Box>
    </Box>
  )
}
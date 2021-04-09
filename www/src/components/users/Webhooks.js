import React, { useState } from 'react'
import { Box, Text, Layer, Anchor, Table, TableBody, TableRow, TableCell } from 'grommet'
import { Refresh } from 'grommet-icons'
import { useQuery, useMutation } from 'react-apollo'
import { WEBHOOKS_Q, PING_WEBHOOK } from './queries'
import { Scroller, ModalHeader, Button, Copyable, InputField, HoveredBackground, BORDER_COLOR } from 'forge-core'
import moment from 'moment'
import { extendConnection } from '../../utils/graphql'

const LABEL_WIDTH = '60px'
const CELL_WIDTH='200px'

function WebhookResult({statusCode, body, headers, url}) {
  const status = statusCode >= 200 && statusCode < 300 ? 'status-ok' : 'status-error'
  return (
    <Box gap='small' border>
      <Box
        direction='row'
        gap='small'
        align='center'
        pad='small'
        border={{side: 'bottom', color: BORDER_COLOR}}>
        <Box background={status} round='xsmall' pad={{vertical: 'xxsmall', horizontal: 'xsmall'}}>
          <Text size='small' >{statusCode}</Text>
        </Box>
        <Box direction='row' align='center' gap='xsmall'>
          <Text weight={500} size='small'>POST</Text>
          <Text size='small'>{url}</Text>
        </Box>
      </Box>
      <Box gap='small' pad='small'>
        <Box gap='xsmall'>
          <Text size='small' weight='bold'>Body</Text>
          <Box direction='row' align='center' gap='small'>
            <Box background='light-2' pad='small'>{body}</Box>
          </Box>
        </Box>
        <Box gap='xsmall'>
          <Text size='small' weight='bold'>Headers</Text>
          <Box direction='row' align='center' gap='small'>
            <Box background='light-2'>
              <Table>
                <TableBody>
                {Object.entries(headers).map((entry) => (
                  <TableRow>
                    <TableCell>
                      <Text size='small' weight='bold'>{entry[0]}:</Text>
                    </TableCell>
                    <TableCell ><Text size='small'>{entry[1]}</Text></TableCell>
                  </TableRow>
                ))}
                </TableBody>
            </Table>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function PingWebhook({id, url}) {
  const [open, setOpen] = useState(false)
  const [repo, setRepo] = useState(null)
  const [mutation, {data}] = useMutation(PING_WEBHOOK, {variables: {repo, id}})
  const pinged = data && data.pingWebhook
  return (
    <>
    <HoveredBackground>
      <Box accentable focusIndicator={false} pad='xsamll' onClick={() => setOpen(true)}>
        <Refresh size='18px'  />
      </Box>
    </HoveredBackground>
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
            {pinged && (<WebhookResult url={url} {...pinged} />)}
          </Box>
        </Box>
      </Layer>
    )}
    </>
  )
}

function Webhook({webhook: {url, insertedAt, id, secret}, hasNext}) {
  return (
    <Box
      onClick={() => null}
      hoverIndicator='light-2'
      border={hasNext ? {side: 'bottom', color: BORDER_COLOR} : null}
      direction='row' pad={{vertical: 'xsmall', horizontal: 'small'}}>
      <Box width='100%' direction='row' align='center' gap='xsmall'>
        <Anchor size='small' onClick={null}>{url}</Anchor>
        <Copyable
          noBorder
          pillText='Copied webhook secret'
          text={secret}
          displayText={<Text size='small' color='dark-3'>({secret.substring(0, 9) + "x".repeat(15)})</Text>} />
      </Box>
      <Box width={CELL_WIDTH} pad='xsmall' direction='row' gap='medium' align='center' justify='end'>
        <Text size='small'>{moment(insertedAt).fromNow()}</Text>
        <PingWebhook id={id} url={url} />
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
    <Scroller
      id='webhooks'
      edges={edges}
      emptyState={<NoWebhooks />}
      style={{overflow: 'auto', height: '100%', width: '100%'}}
      mapper={({node}, next) => (<Webhook key={node.id} webhook={node} hasNext={!!next.node} />)}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {webhooks}}) => extendConnection(prev, webhooks, 'webhooks')
        })
      } />
  )
}
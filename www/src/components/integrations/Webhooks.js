import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'
import { Scroller, Button, ModalHeader } from 'forge-core'
import { WEBHOOKS_Q } from './queries'
import { Box, Layer, Text } from 'grommet'
import { extendConnection } from '../../utils/graphql'
import { useHistory } from 'react-router'
import { ActionTab, CreateWebhook } from './CreateWebhook'
import { Network } from 'grommet-icons'
import { BreadcrumbsContext } from '../Breadcrumbs'

function Webhook({webhook}) {
  let hist = useHistory()
  return (
    <Box flex={false} fill='horizontal' hoverIndicator='light-2' onClick={() => hist.push(`/webhooks/${webhook.id}`)} 
         pad='small' gap='small' border={{side: 'bottom', color: 'light-5'}}> 
      <Box direction='row' align='center' gap='small'>
        <Text size='small' weight={500}>{webhook.name}</Text>
        <Text size='small' color='dark-3'>{webhook.url}</Text>
      </Box>
      <Box direction='row' gap='xsmall' wrap>
        {webhook.actions.map((action) => <ActionTab key={action} action={action} />)}
      </Box>
    </Box>
  )
}

export function Webhooks() {
  const {data, fetchMore} = useQuery(WEBHOOKS_Q, {fetchPolicy: 'cache-and-network'})

  if (!data) return null

  const {pageInfo, edges} = data.integrationWebhooks

  return (
    <Box fill>
      <Scroller
        id='webhooks'
        style={{width: '100%', height: '100%', overflow: 'auto'}}
        edges={edges}
        mapper={({node}) => <Webhook key={node.id} webhook={node} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {integrationWebhooks}}) => extendConnection(
            prev, integrationWebhooks, 'integrationWebhooks'
          )
        })}
      />
    </Box>
  )
}

export function Integrations() {
  const [open, setOpen] = useState(false)
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{url: `/webhooks`, text: 'webhooks'}])
  }, [setBreadcrumbs])

  return (
    <Box fill>
      <Box border={{side: 'bottom', color: 'light-5'}} pad='small' direction='row' align='center'>
        <Box fill='horizontal' direction='row' align='center' gap='small'>
          <Network size='15px' />
          <Text size='small' weight='bold'>Webhooks</Text>
        </Box>
        <Button label='Create' onClick={() => setOpen(true)} />
        {open && (
          <Layer model onClickOutside={() => setOpen(false)}>
            <Box width='50vw'>
              <ModalHeader text='Create a new webhook' setOpen={setOpen} />
              <Box fill>
                <CreateWebhook cancel={() => setOpen(false)} />
              </Box>
            </Box>
          </Layer>
        )}
      </Box>
      <Webhooks />
    </Box>
  )
}
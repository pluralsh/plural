import { useContext, useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Button, Scroller, Webhooks as WebhooksI } from 'forge-core'
import { Box, Layer, Text } from 'grommet'
import { useNavigate } from 'react-router-dom'

import { ModalHeader } from '../ModalHeader'

import { extendConnection } from '../../utils/graphql'

import { BreadcrumbsContext } from '../Breadcrumbs'

import { ActionTab, CreateWebhook } from './CreateWebhook'

import { WEBHOOKS_Q } from './queries'

function Webhook({ webhook }) {
  const navigate = useNavigate()

  return (
    <Box
      flex={false}
      fill="horizontal"
      hoverIndicator="fill-one"
      onClick={() => navigate(`/webhooks/${webhook.id}`)}
      pad="small"
      gap="small"
      border={{ side: 'bottom' }}
      focusIndicator={false}
    >
      <Box
        direction="row"
        align="center"
        gap="small"
      >
        <Text
          size="small"
          weight={500}
        >{webhook.name}
        </Text>
        <Text
          size="small"
          color="dark-3"
        >{webhook.url}
        </Text>
      </Box>
      <Box
        direction="row"
        gap="xsmall"
        wrap
      >
        {webhook.actions.map(action => (
          <ActionTab
            key={action}
            action={action}
            colors={{ bg: 'card', hover: 'cardHover' }}
          />
        ))}
      </Box>
    </Box>
  )
}

export function Webhooks() {
  const { data, fetchMore } = useQuery(WEBHOOKS_Q, { fetchPolicy: 'cache-and-network' })

  if (!data) return null

  const { pageInfo, edges } = data.integrationWebhooks

  return (
    <Box fill>
      <Scroller
        id="webhooks"
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
        edges={edges}
        mapper={({ node }) => (
          <Webhook
            key={node.id}
            webhook={node}
          />
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { integrationWebhooks } }) => extendConnection(
            prev, integrationWebhooks, 'integrationWebhooks'
          ),
        })}
      />
    </Box>
  )
}

export function Integrations() {
  const [open, setOpen] = useState(false)
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{ url: '/webhooks', text: 'webhooks' }])
  }, [setBreadcrumbs])

  return (
    <Box
      fill
      background="background"
    >
      <Box
        border={{ side: 'bottom' }}
        pad="small"
        direction="row"
        align="center"
      >
        <Box
          fill="horizontal"
          direction="row"
          align="center"
          gap="small"
        >
          <WebhooksI size="15px" />
          <Text
            size="small"
            weight="bold"
          >Webhooks
          </Text>
        </Box>
        <Button
          label="Create"
          onClick={() => setOpen(true)}
        />
        {open && (
          <Layer
            model
            onClickOutside={() => setOpen(false)}
          >
            <Box width="50vw">
              <ModalHeader
                text="Create a new webhook"
                setOpen={setOpen}
              />
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

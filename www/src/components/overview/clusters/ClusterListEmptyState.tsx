import { Button, Card, ClusterIcon, Flex } from '@pluralsh/design-system'
import { hasUnfinishedCreation } from 'components/create-cluster/CreateCluster'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import { useDeleteUnfinishedInstance } from './plural-cloud/DeleteInstance'

export default function ClusterListEmptyState() {
  const theme = useTheme()
  const navigate = useNavigate()

  const [showUnfinished, setShowUnfinished] = useState(hasUnfinishedCreation())
  const { triggerDelete, loading } = useDeleteUnfinishedInstance({
    onClear: () => setShowUnfinished(false),
  })

  return (
    <Card css={{ minWidth: 'fit-content' }}>
      <Wrapper>
        <ClusterIcon size={theme.spacing.xxxlarge} />
        <Flex
          direction="column"
          gap="xxsmall"
          textAlign="center"
          marginTop={theme.spacing.medium}
        >
          <span css={theme.partials.text.subtitle2}>
            You don't have any clusters yet.
          </span>
          <span
            css={{
              ...theme.partials.text.body2,
              color: theme.colors['text-light'],
            }}
          >
            Once you create your first cluster, you will find an overview of its
            details here.
          </span>
        </Flex>
        <Button
          css={{ maxWidth: 300, width: '100%' }}
          onClick={() => navigate('/create-cluster')}
        >
          {showUnfinished ? 'Resume cluster creation' : 'Create cluster'}
        </Button>
        {showUnfinished && (
          <Button
            loading={loading}
            destructive
            css={{ maxWidth: 300, width: '100%' }}
            onClick={triggerDelete}
          >
            Cancel cluster creation
          </Button>
        )}
      </Wrapper>
    </Card>
  )
}

const Wrapper = styled.div(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '600px',
  padding: `${theme.spacing.xxxlarge}px`,
  gap: `${theme.spacing.medium}px`,
}))

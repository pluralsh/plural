import { Button, Card, Flex } from '@pluralsh/design-system'
import { hasUnfinishedCreation } from 'components/create-cluster/CreateCluster'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Body2P, Title2H1 } from 'components/utils/Typography'
import ReactPlayer from 'react-player'
import { ClustersHelpSection } from './ClustersHelpSection'
import { useDeleteUnfinishedInstance } from './plural-cloud/DeleteInstance'

export function ClusterListEmptyState() {
  const [showUnfinished, setShowUnfinished] = useState(hasUnfinishedCreation())
  const { triggerDelete, loading } = useDeleteUnfinishedInstance({
    onClear: () => setShowUnfinished(false),
  })

  return (
    <GridWrapSC>
      <CreateClusterCardSC>
        <Flex
          direction="column"
          gap="small"
          textAlign="center"
        >
          <Title2H1 css={{ fontWeight: 400 }}>
            Create your first Plural instance
          </Title2H1>
          <Body2P
            $color="text-light"
            css={{ maxWidth: 450 }}
          >
            Once you create your first management plane, you will find an
            overview of its details here.
          </Body2P>
        </Flex>
        <Button
          as={Link}
          to="/create-cluster"
          style={{ maxWidth: 300, width: '100%' }}
        >
          {showUnfinished
            ? 'Resume instance creation'
            : 'Create new Plural instance'}
        </Button>
        {showUnfinished && (
          <Button
            loading={loading}
            destructive
            css={{ maxWidth: 300, width: '100%' }}
            onClick={triggerDelete}
          >
            Cancel instance creation
          </Button>
        )}
      </CreateClusterCardSC>
      <Card css={{ overflow: 'clip', minWidth: 450 }}>
        <ReactPlayer
          url="https://www.youtube.com/watch?v=sEb_gflm-ME"
          controls
          width="100%"
          height="100%"
        />
      </Card>
      <div css={{ gridColumn: '1 / -1' }}>
        <ClustersHelpSection />
      </div>
    </GridWrapSC>
  )
}

const GridWrapSC = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateRows: '300px auto',
  gap: `${theme.spacing.xlarge}px ${theme.spacing.large}px`,
}))

const CreateClusterCardSC = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 450,
  background: theme.colors['fill-zero'],
  padding: `${theme.spacing.xxxlarge}px`,
  gap: `${theme.spacing.medium}px`,
}))

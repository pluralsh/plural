import { BrowseAppsIcon, Button, Card } from '@pluralsh/design-system'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const Wrapper = styled.div<{backgroundImage?: string}>(({ theme }) => ({
  ...theme.partials.text.body1Bold,
  borderRadius: theme.borderRadiuses.large,
  minHeight: 180,
  minWidth: 500,
  position: 'relative',

  '.cta': {
    display: 'flex',
    gap: theme.spacing.medium,
    marginTop: theme.spacing.large,
  },
}))

export default function ClusterListEmptyState() {
  const navigate = useNavigate()

  return (
    <Wrapper backgroundImage="/placeholders/clusters.png">
      <img
        src="/placeholders/clusters.png"
        width="100%"
      />
      <Card
        padding="large"
        position="absolute"
        top={24}
        bottom={24}
        left={24}
        right={24}
        margin="auto"
        height="max-content"
        width="max-content"
        fillLevel={2}
      >
        <div>Create your first cluster and install applications.</div>
        <div className="cta">
          <Button>Start onboarding</Button> {/* TODO: Navigate. */}
          <Button
            secondary
            startIcon={<BrowseAppsIcon />}
            onClick={() => navigate('/marketplace')}
          >
            Browse the marketplace
          </Button>
        </div>
      </Card>
    </Wrapper>
  )
}

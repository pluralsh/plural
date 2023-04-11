import { BrowseAppsIcon, Button, Card } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { useNavigate } from 'react-router-dom'

export default function ClusterListEmptyState() {
  const navigate = useNavigate()

  return (
    <Div
      minHeight={180}
      minWidth={500}
      position="relative"
    >
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
        <Div
          body1
          fontWeight={600}
        >
          Create your first cluster and install applications.
        </Div>
        <Flex
          gap="medium"
          marginTop="large"
        >
          <Button>Start onboarding</Button> {/* TODO: Navigate. */}
          <Button
            secondary
            startIcon={<BrowseAppsIcon />}
            onClick={() => navigate('/marketplace')}
          >
            Browse the marketplace
          </Button>
        </Flex>
      </Card>
    </Div>
  )
}

import { BrowseAppsIcon, Button, Card } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { Link } from 'react-router-dom'

export default function ClusterListEmptyState() {
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
          <Button
            as={Link}
            to="/shell"
          >
            Start onboarding
          </Button>
          <Button
            secondary
            startIcon={<BrowseAppsIcon />}
            as={Link}
            to="/marketplace"
            textDecoration="none"
          >
            Browse the marketplace
          </Button>
        </Flex>
      </Card>
    </Div>
  )
}

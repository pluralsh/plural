import { Link } from 'react-router-dom'
import { Button, Card } from '@pluralsh/design-system'
import { Div, Flex, P } from 'honorable'
import { capitalize } from 'lodash'

type BillingFeatureBlockBannerPropsType = {
  feature: 'service accounts' | 'groups' | 'roles'
}

const featureToPunchline = {
  'service accounts': 'Create assumable identities that enable multiple people to manage Plural installations.',
  groups: 'Organize your users into groups to more easily apply permissions to sub-sections of your team. e.g. ops, end-users, and admins.',
  roles: 'Define granular permissions for your organization\'s users and apply them to groups or individuals.',
}

function BillingFeatureBlockBanner({ feature }: BillingFeatureBlockBannerPropsType) {
  return (
    <Flex
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      align="center"
      justify="center"
      direction="column"
      backgroundColor="#00000066"
      borderRadius="large"
      padding="medium"
    >
      <Card
        padding="large"
        fillLevel={2}
      >
        <Div
          body1
          fontWeight="bold"
        >
          Upgrade your plan to access {capitalize(feature)}.
        </Div>
        <P
          body2
          color="text-light"
          marginTop="medium"
        >
          {featureToPunchline[feature]}
        </P>
        <Flex marginTop="large">
          <Button
            as={Link}
            to="/account/billing"
          >
            Review plans
          </Button>
        </Flex>
      </Card>
    </Flex>
  )
}

export default BillingFeatureBlockBanner

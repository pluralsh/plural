import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Button, Flex, Modal } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import usePersistedState from '../../../hooks/usePersistedState'
import SubscriptionContext from '../../../contexts/SubscriptionContext'
import { LocalStorageKeys } from '../../../constants'
import { Body2P, InlineA } from '../../utils/Typography'

function BillingMigrationModal() {
  const theme = useTheme()
  const { isGrandfathered, isPaidPlan } = useContext(SubscriptionContext)
  const [open, setOpen] = usePersistedState(
    LocalStorageKeys.BillingMigrationModalOpen,
    isGrandfathered && !isPaidPlan
  )

  return (
    <Modal
      header="Announcing our pro tier"
      open={open}
      onClose={() => setOpen(false)}
    >
      <img
        src="/sam_profile_picture.png"
        width={92}
        alt="Sam Weaver"
      />
      <Body2P css={{ marginTop: theme.spacing.medium }}>
        We're excited to launch our new Pro tier pricing! Our Pro tier is
        designed around enabling teams to collaborate in Plural without the need
        to become an Enterprise customer.
        <br />
        <br />
        If you want to take advantage of roles, groups and other awesome
        features like VPN and expert support SLA, you can upgrade to Pro. We
        think you’ll love it!
        <br />
        <br />
        Read more about our new pricing plan on{' '}
        <InlineA href="https://www.plural.sh/blog/changes-to-plurals-pricing/">
          our blog
        </InlineA>
        .
      </Body2P>
      <Flex
        justify="flex-end"
        marginTop="large"
        gap="medium"
      >
        <Button
          tertiary
          onClick={() => setOpen(false)}
        >
          Close
        </Button>
        <Button
          as={Link}
          to="/account/billing"
          onClick={() => setOpen(false)}
        >
          Upgrade now
        </Button>
      </Flex>
    </Modal>
  )
}

export default BillingMigrationModal

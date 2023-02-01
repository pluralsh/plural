import { Link } from 'react-router-dom'
import { Button, Modal } from '@pluralsh/design-system'
import {
  A,
  Flex,
  Img,
  P,
} from 'honorable'

import usePersistedState from '../../../hooks/usePersistedState'

function BillingMigrationModal() {
  const [open, setOpen] = usePersistedState('billing-migration-modal-open', true)

  return (
    <Modal
      header="Announcing our pro tier"
      open={open}
      onClose={() => setOpen(false)}
    >
      <Img
        src="/sam_profile_picture.png"
        width={92}
        alt="Sam Weaver"
      />
      <P
        body2
        marginTop="medium"
      >
        We're excited to launch our new Pro tier pricing!  Our Pro tier is designed around enabling teams to collaborate in Plural without the need to become an Enterprise customer.
        <br />
        <br />
        As a user with roles and service accounts enabled, you will now fall into the Pro tier which also includes unlimited app deployments and expert support with an SLA. We think you'll love it!
        <br />
        <br />
        Read more about our new pricing plan on
        {' '}
        <A
          inline
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          our blog
        </A>.
      </P>
      <Flex
        justify="flex-end"
        marginTop="large"
      >
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

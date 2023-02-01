import { Link } from 'react-router-dom'
import { A, P } from 'honorable'

function BillingLegacyUserMessage() {
  const open = true
  const expired = false

  if (!open) return null

  return (
    <P
      overline
      color="text-xlight"
    >
      Legacy user access {expired ? 'expired' : 'until May 1, 2023'}
      {' '}
      <A
        inline
        as={Link}
        to="/account/billing"
      >
        upgrade now
      </A>
    </P>
  )
}

export default BillingLegacyUserMessage

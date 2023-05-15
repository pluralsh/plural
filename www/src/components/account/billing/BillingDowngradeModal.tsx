import { useCallback, useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Div, Flex } from 'honorable'
import { Button, Modal } from '@pluralsh/design-system'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

import { DOWNGRADE_TO_FREE_PLAN_MUTATION } from './queries'

import BillingError from './BillingError'

type BillingDowngradeModalPropsType = {
  open: boolean
  onClose: () => void
}

function Success() {
  return (
    <>
      <Div>You've successfully downgraded to the free plan.</Div>
      <Flex
        justify="flex-end"
        marginTop="large"
      >
        <Button
          as={Link}
          to="/marketplace"
        >
          Explore the app
        </Button>
      </Flex>
    </>
  )
}

function BillingDowngradeModal({
  open,
  onClose,
}: BillingDowngradeModalPropsType) {
  const { refetch: refetchSubscription, isProPlan } =
    useContext(SubscriptionContext)

  const [downgradeMutation, { loading }] = useMutation(
    DOWNGRADE_TO_FREE_PLAN_MUTATION
  )

  const [error, setError] = useState<Error | undefined>(undefined)

  const handleDowngrade = useCallback(() => {
    downgradeMutation()
      .then(() => {
        refetchSubscription()
      })
      .catch((e) => {
        setError(e)
      })
  }, [downgradeMutation, refetchSubscription])

  return (
    <Modal
      open={open}
      onClose={onClose}
      header="Downgrade to free"
      size="large"
    >
      {error ? (
        <BillingError>{error.message}</BillingError>
      ) : !isProPlan ? (
        <Success />
      ) : (
        <>
          <Div>Are you certain you want to downgrade to the free plan?</Div>
          <Flex
            justify="flex-end"
            marginTop="xxlarge"
          >
            <Button
              onClick={handleDowngrade}
              loading={loading}
            >
              Downgrade
            </Button>
          </Flex>
        </>
      )}
    </Modal>
  )
}

export default BillingDowngradeModal

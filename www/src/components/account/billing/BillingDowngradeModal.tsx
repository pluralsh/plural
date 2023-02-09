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

function BillingDowngradeModal({ open, onClose }: BillingDowngradeModalPropsType) {
  const { refetch: refetchSubscription } = useContext(SubscriptionContext)

  const [downgradeMutation, { loading }] = useMutation(DOWNGRADE_TO_FREE_PLAN_MUTATION)

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const handleDowngrade = useCallback(() => {
    downgradeMutation()
      .then(() => {
        setSuccess(true)
        refetchSubscription()
      })
      .catch(() => {
        setError(true)
      })
  }, [downgradeMutation, refetchSubscription])

  const renderContent = useCallback(() => (
    <>
      <Div>
        Are you certain you want to downgrade to the free plan?
      </Div>
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
  ), [
    loading,
    handleDowngrade,
  ])

  const renderSuccess = useCallback(() => (
    <>
      <Div>
        You've successfully downgraded to the free plan.
      </Div>
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
  ), [])

  return (
    <Modal
      open={open}
      onClose={onClose}
      header="Downgrade to free"
      minWidth={512 + 128}
    >
      {error ? <BillingError /> : success ? renderSuccess() : renderContent()}
    </Modal>
  )
}

export default BillingDowngradeModal

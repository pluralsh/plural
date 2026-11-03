import { useCallback, useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Button, Flex, Modal } from '@pluralsh/design-system'

import SubscriptionContext from '../../../contexts/SubscriptionContext'
import { PLURAL_CLOUD_INSTANCES_PATH_ABS } from '../../overview/clusters/plural-cloud/PluralCloudInstances'
import { Body1P } from '../../utils/Typography'

import { DOWNGRADE_TO_FREE_PLAN_MUTATION } from './queries'

import BillingError from './BillingError'

type BillingDowngradeModalPropsType = {
  open: boolean
  onClose: () => void
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

  const handleClose = useCallback(() => {
    setError(undefined)
    onClose()
  }, [onClose])

  return (
    <Modal
      open={open}
      onClose={handleClose}
      header="Downgrade to free"
      actions={
        <Flex gap="medium">
          {error || !isProPlan ? (
            <>
              <Button
                secondary
                onClick={handleClose}
              >
                Close
              </Button>
              {!error && (
                <Button
                  as={Link}
                  to={PLURAL_CLOUD_INSTANCES_PATH_ABS}
                >
                  Go to control planes
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                secondary
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDowngrade}
                loading={loading}
              >
                Downgrade
              </Button>
            </>
          )}
        </Flex>
      }
    >
      {error ? (
        <BillingError>{error.message}</BillingError>
      ) : (
        <Body1P>
          {isProPlan
            ? 'Are you certain you want to downgrade to the free plan?'
            : "You've successfully downgraded to the free plan."}
        </Body1P>
      )}
    </Modal>
  )
}

export default BillingDowngradeModal

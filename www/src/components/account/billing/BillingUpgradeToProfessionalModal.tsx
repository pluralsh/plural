import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { Div, Flex } from 'honorable'
import { Button, Modal } from '@pluralsh/design-system'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'
import BillingBankCardContext from '../../../contexts/BillingBankCardContext'
import SubscriptionContext from '../../../contexts/SubscriptionContext'

import { UPGRADE_TO_PROFESSIONAL_PLAN_MUTATION } from './queries'

import useBankCard from './useBankCard'

import BillingPreview from './BillingPreview'
import BillingError from './BillingError'

type BillingUpgradeToProfessionalModalPropsType = {
  open: boolean
  onClose: () => void
}

function BillingUpgradeToProfessionalModal({ open, onClose }: BillingUpgradeToProfessionalModalPropsType) {
  const { proPlatformPlan, proYearlyPlatformPlan } = useContext(PlatformPlansContext)
  const { card } = useContext(BillingBankCardContext)
  const { refetch: refetchSubscription } = useContext(SubscriptionContext)

  const [applyYearlyDiscount, setApplyYearlyDiscount] = useState(false)

  console.log('applyYearlyDiscount', applyYearlyDiscount);
  const [upgradeMutation, { loading: loadingUpgradeMutation }] = useMutation(UPGRADE_TO_PROFESSIONAL_PLAN_MUTATION, {
    variables: {
      planId: proPlatformPlan.id,
    },
  })

  const [edit, setEdit] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const { error: cardError, renderEdit, renderDisplay } = useBankCard(setEdit, true)

  const handleUpgrade = useCallback(() => {
    if (!card) return

    upgradeMutation()
      .then(() => {
        setSuccess(true)
        refetchSubscription()
      })
      .catch(() => {
        setError(true)
      })
  }, [card, upgradeMutation, refetchSubscription])

  const renderContent = useCallback(() => (
    <>
      <BillingPreview
        noCard
        discountPreview
        onChange={setApplyYearlyDiscount}
      />
      <Div
        fontWeight="bold"
        marginTop="medium"
        marginBottom="small"
      >
        Your payment details
      </Div>
      {edit || !card ? renderEdit() : renderDisplay()}
      <Flex
        justify="flex-end"
        marginTop="xxlarge"
      >
        <Button
          onClick={handleUpgrade}
          loading={loadingUpgradeMutation}
          disabled={!card}
        >
          Upgrade
        </Button>
      </Flex>
    </>
  ), [
    edit,
    card,
    loadingUpgradeMutation,
    renderDisplay,
    renderEdit,
    handleUpgrade,
  ])

  const renderSuccess = useCallback(() => (
    <>
      <Div>
        Welcome to the Plural Professional plan! You now have access to groups, roles, service accounts, and more.
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

  useEffect(() => {
    if (!card) return

    setEdit(false)
  }, [card])

  return (
    <Modal
      open={open}
      onClose={onClose}
      header="Upgrade to professional"
      minWidth={512 + 128}
    >
      {(error || cardError) ? <BillingError /> : success ? renderSuccess() : renderContent()}
    </Modal>
  )
}

export default BillingUpgradeToProfessionalModal

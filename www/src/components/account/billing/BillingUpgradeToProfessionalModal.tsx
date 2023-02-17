import {
  FormEvent,
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

import { SUBSCRIPTION_QUERY, UPGRADE_TO_PROFESSIONAL_PLAN_MUTATION } from './queries'

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

  const [applyYearlyDiscount, setApplyYearlyDiscount] = useState(false)

  const [upgradeMutation, { loading }] = useMutation(UPGRADE_TO_PROFESSIONAL_PLAN_MUTATION, {
    variables: {
      planId: applyYearlyDiscount ? proYearlyPlatformPlan.id : proPlatformPlan.id,
    },
    refetchQueries: [SUBSCRIPTION_QUERY],
    onCompleted: () => setSuccess(true),
    onError: () => setError(true),
  })

  const [edit, setEdit] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const { error: cardError, renderEdit, renderDisplay } = useBankCard(setEdit, true)

  const handleUpgrade = useCallback((event: FormEvent) => {
    event.preventDefault()

    if (!card) return

    upgradeMutation()
  }, [card, upgradeMutation])

  const renderContent = useCallback(() => (
    <>
      <BillingPreview
        noCard
        discountPreview
        yearly={applyYearlyDiscount}
        onChange={setApplyYearlyDiscount}
      />
      <Div
        fontWeight="bold"
        marginTop="large"
        marginBottom="medium"
      >
        Billing information
      </Div>
      {edit || !card ? renderEdit() : renderDisplay()}
      <form onSubmit={handleUpgrade}>
        <Flex
          justify="flex-end"
          marginTop="xxlarge"
        >
          <Button
            type="submit"
            loading={loading}
            disabled={!card}
          >
            Upgrade
          </Button>
        </Flex>
      </form>
    </>
  ), [
    edit,
    card,
    applyYearlyDiscount,
    loading,
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

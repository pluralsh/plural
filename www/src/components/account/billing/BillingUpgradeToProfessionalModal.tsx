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
import { Button, Card, Modal } from '@pluralsh/design-system'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'

import { SUBSCRIPTION_QUERY, UPGRADE_TO_PROFESSIONAL_PLAN_MUTATION } from './queries'

import useBankCard from './useBankCard'

import BillingPreview from './BillingPreview'
import BillingError from './BillingError'

type BillingUpgradeToProfessionalModalPropsType = {
  open: boolean
  onClose: () => void
}

function BillingUpgradeToProfessionalModal({
  open,
  onClose,
}: BillingUpgradeToProfessionalModalPropsType) {
  const { proPlatformPlan, proYearlyPlatformPlan }
    = useContext(PlatformPlansContext)
  const [applyYearlyDiscount, setApplyYearlyDiscount] = useState(false)

  const [upgradeMutation, { loading }] = useMutation(UPGRADE_TO_PROFESSIONAL_PLAN_MUTATION,
    {
      variables: {
        planId: applyYearlyDiscount
          ? proYearlyPlatformPlan.id
          : proPlatformPlan.id,
      },
      refetchQueries: [SUBSCRIPTION_QUERY],
      onCompleted: () => setSuccess(true),
      onError: () => setError(true),
    })

  const [edit, setEdit] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const {
    error: cardError,
    renderEdit,
    renderDisplay,
    card,
  } = useBankCard({ setEdit, noCancel: true })

  const onSubmit = useCallback((event: FormEvent) => {
    event.preventDefault()
    if (!card) {
      return
    }

    upgradeMutation()
  },
  [card, upgradeMutation])

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
      <Flex
        flexDirection="column"
        gap="xlarge"
      >
        {edit || !card ? renderEdit() : renderDisplay()}
      </Flex>
      {(error || cardError) && (
        <Card
          marginTop="medium"
          padding="medium"
        >
          <BillingError>{error || cardError}</BillingError>
        </Card>
      )}
      <form onSubmit={onSubmit}>
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
  ),
  [
    applyYearlyDiscount,
    edit,
    card,
    renderEdit,
    renderDisplay,
    error,
    cardError,
    onSubmit,
    loading,
  ])

  const renderSuccess = useCallback(() => (
    <>
      <Div>
        Welcome to the Plural Professional plan! You now have access to
        groups, roles, service accounts, and more.
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
  ),
  [])

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
      {success ? renderSuccess() : <>{renderContent()}</>}
    </Modal>
  )
}

export default BillingUpgradeToProfessionalModal

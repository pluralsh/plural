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
import {
  Button,
  FormField,
  Input,
  Modal,
} from '@pluralsh/design-system'
import { AddressElement, useElements } from '@stripe/react-stripe-js'

import PlatformPlansContext from '../../../contexts/PlatformPlansContext'
import BillingBankCardContext from '../../../contexts/BillingBankCardContext'
import SubscriptionContext from '../../../contexts/SubscriptionContext'

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
  const { card } = useContext(BillingBankCardContext)
  const { billingAddress } = useContext(SubscriptionContext)

  const [applyYearlyDiscount, setApplyYearlyDiscount] = useState(false)

  const [updatedAddress, setUpdatedAddress] = useState({
    name: billingAddress?.name || '',
    line1: billingAddress?.line1 || '',
    line2: billingAddress?.line2 || '',
    city: billingAddress?.city || '',
    state: billingAddress?.state || '',
    zip: billingAddress?.zip || '',
    country: billingAddress?.country || '',
  })
  const stripeElements = useElements()

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
  } = useBankCard(setEdit, updatedAddress, true)

  const handleUpgrade = useCallback((event: FormEvent) => {
    event.preventDefault()

    const addressElt = stripeElements?.getElement('address')

    console.log('addressElt', addressElt)
    ;(addressElt as any)?.getValue().then(v => {
      console.log('value', v)
      if (v.complete && card) {
        upgradeMutation()
      }
    })
  },
  [card, stripeElements, upgradeMutation])

  const renderBillingForm = useCallback(() => (
    <AddressElement
      options={{
        mode: 'billing',
        defaultValues: {
          name: updatedAddress.name,
          address: {
            line1: updatedAddress.line1,
            line2: updatedAddress.line2,
            city: updatedAddress.city,
            state: updatedAddress.state,
            country: updatedAddress.country,
            postal_code: updatedAddress.zip,
          },
        },
      }}
      onChange={event => {
        const { name, address } = event?.value || {}

        setUpdatedAddress({
          name,
          line1: address.line1,
          line2: address.line2 ?? '',
          city: address.city,
          state: address.state,
          country: address.country,
          zip: address.postal_code,
        })
      }}
    />
  ),
  [
    updatedAddress.city,
    updatedAddress.country,
    updatedAddress.line1,
    updatedAddress.line2,
    updatedAddress.name,
    updatedAddress.state,
    updatedAddress.zip,
  ])

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
        {!card ? renderBillingForm() : null}
        {edit || !card ? renderEdit() : renderDisplay()}
      </Flex>
      <form onSubmit={handleUpgrade}>
        <Flex
          justify="flex-end"
          marginTop="xxlarge"
        >
          <Button
            type="submit"
            loading={loading}
            // disabled={!card}
          >
            Upgrade
          </Button>
        </Flex>
      </form>
    </>
  ),
  [
    edit,
    card,
    applyYearlyDiscount,
    loading,
    renderDisplay,
    renderEdit,
    renderBillingForm,
    handleUpgrade,
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
      {error || cardError ? (
        <BillingError />
      ) : success ? (
        renderSuccess()
      ) : (
        renderContent()
      )}
    </Modal>
  )
}

export default BillingUpgradeToProfessionalModal

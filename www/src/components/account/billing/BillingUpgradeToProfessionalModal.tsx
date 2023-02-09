import {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

function BillingUpgradeToProfessionalModal({ open, onClose }: BillingUpgradeToProfessionalModalPropsType) {
  const { proPlatformPlan, proYearlyPlatformPlan } = useContext(PlatformPlansContext)
  const { card } = useContext(BillingBankCardContext)
  const { billingAddress } = useContext(SubscriptionContext)

  const [applyYearlyDiscount, setApplyYearlyDiscount] = useState(false)
  const [name, setName] = useState(billingAddress?.name || '')
  const [line1, setLine1] = useState(billingAddress?.line1 || '')
  const [line2, setLine2] = useState(billingAddress?.line2 || '')
  const [city, setCity] = useState(billingAddress?.city || '')
  const [state, setState] = useState(billingAddress?.state || '')
  const [zip, setZip] = useState(billingAddress?.zip || '')
  const [country, setCountry] = useState(billingAddress?.country || '')

  const updatedAddress = useMemo(() => ({
    name, line1, line2, city, state, zip, country,
  }), [name, line1, line2, city, state, zip, country])

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

  const { error: cardError, renderEdit, renderDisplay } = useBankCard(setEdit, updatedAddress, true)

  const handleUpgrade = useCallback((event: FormEvent) => {
    event.preventDefault()

    if (!card) return

    upgradeMutation()
  }, [card, upgradeMutation])

  const renderBillingForm = useCallback(() => (
    <>
      <FormField
        required
        label="Full name"
        marginTop="xsmall"
      >
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Enter full name or company name"
        />
      </FormField>
      <FormField
        required
        label="Address line 1"
        marginTop="xsmall"
      >
        <Input
          value={line1}
          onChange={event => setLine1(event.target.value)}
          placeholder="Enter street address"
        />
      </FormField>
      <FormField
        label="Address line 2"
        marginTop="xsmall"
      >
        <Input
          value={line2}
          onChange={event => setLine2(event.target.value)}
          placeholder="Optional"
        />
      </FormField>
      <FormField
        required
        label="City"
        marginTop="xsmall"
      >
        <Input
          value={city}
          onChange={event => setCity(event.target.value)}
          placeholder="Enter city name"
        />
      </FormField>
      <FormField
        required
        label="State/Province/Region"
        marginTop="xsmall"
      >
        <Input
          value={state}
          onChange={event => setState(event.target.value)}
          placeholder="Enter state, province, or region"
        />
      </FormField>
      <Flex
        gap="medium"
        marginTop="xxsmall"
      >
        <FormField
          required
          label="Zip/Postal code"
          flexGrow={1}
        >
          <Input
            value={zip}
            onChange={event => setZip(event.target.value)}
            placeholder="Enter zip, or postal code"
          />
        </FormField>
        <FormField
          required
          label="Country"
          flexGrow={1}
        >
          <Input
            value={country}
            onChange={event => setCountry(event.target.value)}
            placeholder="Enter country"
          />
        </FormField>
      </Flex>
    </>
  ), [
    name,
    line1,
    line2,
    city,
    state,
    zip,
    country,
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
      {!card ? renderBillingForm() : null}
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
    renderBillingForm,
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

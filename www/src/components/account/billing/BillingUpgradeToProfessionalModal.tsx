import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Div, Flex, Spinner } from 'honorable'
import { Button, Modal } from '@pluralsh/design-system'

import { CARDS_QUERY } from './queries'

import useBankCard from './useBankCard'

import BillingPreview from './BillingPreview'

type BillingUpgradeToProfessionalModalPropsType = {
  open: boolean
  onClose: () => void
}

function BillingUpgradeToProfessionalModal({ open, onClose }: BillingUpgradeToProfessionalModalPropsType) {
  const {
    data,
    loading: loadingCards,
    error,
    refetch,
  } = useQuery(CARDS_QUERY, {
    fetchPolicy: 'network-only',
  })
  // const [upgradeMutation, { loading: loadingUpgradeMutation }] = useMutation(UPGRADE_TO_PROFESSIONAL_PLAN_MUTATION, {

  // })

  const [edit, setEdit] = useState(true)

  const card = useMemo(() => data?.me?.cards?.edges?.[0]?.node ?? null, [data])

  const { error: cardError, renderEdit, renderDisplay } = useBankCard(
    card, setEdit, refetch, true
  )

  const handleUpgrade = useCallback(() => {

  }, [])

  const renderLoading = useCallback(() => (
    <Spinner />
  ), [])

  const renderError = useCallback(() => (
    <Div body2>
      An error occured. Please reload the page or contact support.
    </Div>
  ), [])

  const renderContent = useCallback(() => (
    <>
      <BillingPreview
        noCard
        discountPreview
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
          disabled={!card}
        >
          Upgrade
        </Button>
      </Flex>
    </>
  ), [edit, card, renderDisplay, renderEdit, handleUpgrade])

  useEffect(() => {
    if (loadingCards || !card) return

    setEdit(false)
  }, [loadingCards, card])

  return (
    <Modal
      open={open}
      onClose={onClose}
      header="Upgrade to professional"
      minWidth={512 + 128}
    >
      {(error || cardError) ? renderError() : loadingCards ? renderLoading() : renderContent()}
    </Modal>
  )
}

export default BillingUpgradeToProfessionalModal

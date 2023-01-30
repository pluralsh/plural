import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useQuery } from '@apollo/client'
import { Div, Spinner } from 'honorable'
import { Modal } from '@pluralsh/design-system'

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
    loading,
    error,
    refetch,
  } = useQuery(CARDS_QUERY, {
    fetchPolicy: 'network-only',
  })

  const [edit, setEdit] = useState(true)

  const card = useMemo(() => data?.me?.cards?.edges?.[0]?.node ?? null, [data])

  const { error: cardError, renderEdit, renderDisplay } = useBankCard(
    card, setEdit, refetch, true
  )

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
        marginVertical="medium"
      >
        Your payment details
      </Div>
      {edit || !card ? renderEdit() : renderDisplay()}
    </>
  ), [edit, card, renderDisplay, renderEdit])

  useEffect(() => {
    if (loading || !card) return

    setEdit(false)
  }, [loading, card])

  return (
    <Modal
      open={open}
      onClose={onClose}
      header="Upgrade to professional"
      minWidth={512 + 128}
    >
      {(error || cardError) ? renderError() : loading ? renderLoading() : renderContent()}
    </Modal>
  )
}

export default BillingUpgradeToProfessionalModal

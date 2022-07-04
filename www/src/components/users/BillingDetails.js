import 'react-credit-cards/es/styles-compiled.css'
import './stripe.css'
import './billing.css'
import { useCallback, useContext, useState } from 'react'
import { CardElement, Elements, injectStripe } from 'react-stripe-elements'
import { Box, Layer, Text } from 'grommet'
import { useMutation, useQuery } from '@apollo/client'
import { Button, PaymentMethods, Trash } from 'forge-core'
import { Amex, Mastercard, Visa } from 'grommet-icons'

import { ModalHeader } from '../ModalHeader'
import { TagContainer } from '../repos/Tags'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { SectionPortal } from '../Explore'
import { HeaderItem } from '../repos/Docker'
import { Icon } from '../accounts/Group'
import { CurrentUserContext } from '../login/CurrentUser'

import { CARDS, DELETE_CARD, REGISTER_CARD } from './queries'

function _CardForm({ stripe, onCompleted }) {
  const [stripeError, setStripeError] = useState(null)
  const [mutation, { loading, error }] = useMutation(REGISTER_CARD, {
    refetchQueries: [{ query: CARDS }],
    onCompleted,
  })
  const onClick = useCallback(() => {
    stripe.createToken().then(({ token, error }) => {
      setStripeError(error)
      if (token && token.id) return mutation({ variables: { source: token.id } })
    })
  }, [stripe, mutation])

  return (
    <Box
      fill="horizontal"
      pad="small"
      gap="xsmall"
      align="center"
    >
      {stripeError && (
        <Alert
          header={stripeError.message}
          status={AlertStatus.ERROR}
          description="Try again with a different card"
        />
      )}
      {error && (
        <GqlError
          error={error}
          header="Error registering card"
        />
      )}
      <Box fill="horizontal">
        <CardElement />
      </Box>
      <Box
        flex={false}
        justify="end"
        fill="horizontal"
      >
        <Button
          flex={false}
          loading={loading}
          label="Register"
          onClick={onClick}
        />
      </Box>
    </Box>
  )
}

const CardForm = injectStripe(_CardForm)

function CardInputForm({ me, onCompleted }) {
  return (
    <Elements>
      <CardForm
        me={me}
        onCompleted={onCompleted}
      />
    </Elements>
  )
}

const cardNumber = last4 => `**** **** **** ${last4}`
const expiry = (expMonth, expYear) => `${expMonth > 10 ? expMonth : `0${expMonth}`}/${expYear}`

export function CardIcon({ brand }) {
  switch (brand.toLowerCase()) {
    case 'visa':
      return (
        <Visa
          color="plain"
          size="medium"
        />
      )
    case 'mastercard':
      return (
        <Mastercard
          color="plain"
          size="medium"
        />
      )
    case 'amex':
      return (
        <Amex
          color="plain"
          size="medium"
        />
      )
    default:
      return <PaymentMethods size="medium" />
  }
}

function CardHeader() {
  return (
    <Box
      direction="row"
      pad="small"
      gap="xsmall"
      border={{ side: 'bottom', color: 'border' }}
      align="center"
    >
      <HeaderItem
        text="Brand"
        width="20%"
      />
      <HeaderItem
        text="Number"
        width="25%"
      />
      <HeaderItem
        text="Name"
        width="25%"
      />
      <HeaderItem
        text="Expiration"
        width="30%"
      />
    </Box>
  )
}

function CardRow({ card, noDelete }) {
  const [mutation] = useMutation(DELETE_CARD, {
    variables: { id: card.id },
    refetchQueries: [{ query: CARDS }],
  })

  return (
    <Box
      direction="row"
      pad={{ horizontal: 'small', vertical: 'xsmall' }}
      gap="xsmall"
      align="center"
      border={{ side: 'bottom', color: 'border' }}
    >
      <Box
        width="20%"
        gap="small"
        direction="row"
        align="center"
      >
        <CardIcon brand={card.brand} />
        <Text size="small">{card.brand}</Text>
      </Box>
      <HeaderItem
        nobold
        text={`**** **** **** ${card.last4}`}
        width="25%"
      />
      <HeaderItem
        nobold
        text={card.name || 'John Doe'}
        width="25%"
      />
      {!noDelete && (
        <Box
          width="30%"
          direction="row"
          gap="small"
          align="center"
        >
          <Box fill="horizontal">
            <Text size="small">{card.expMonth} / {card.expYear}</Text>
          </Box>
          <Icon
            icon={Trash}
            tooltip="delete"
            onClick={mutation}
          />
        </Box>
      )}
    </Box>
  )
}

export function CardOption({ card, current, setCurrent }) {
  return (
    <TagContainer
      pad="small"
      gap="small"
      enabled={card.id === current.id}
      onClick={() => setCurrent(card)}
    >
      <CardIcon brand={card.brand} />
      <Box>
        <Text size="small">{cardNumber(card.last4)}</Text>
        <Text
          size="small"
          color="dark-3"
        >{expiry(card.expMonth, card.expYear)}
        </Text>
      </Box>
    </TagContainer>
  )
}

export function CardList() {
  const me = useContext(CurrentUserContext)
  const [open, setOpen] = useState(false)
  const { data, loading, refetch } = useQuery(CARDS)
  const onCompleted = useCallback(() => {
    setOpen(false)
    refetch()
  }, [refetch, setOpen])
  if (!data || loading) return null

  const { edges } = data.me.cards

  return (
    <>
      <Box fill>
        <CardHeader />
        {edges.map(({ node: card }) => (
          <CardRow
            key={card.id}
            card={card}
          />
        ))}
        <SectionPortal>
          <Button
            label="Add a card"
            onClick={() => setOpen(true)}
          />
        </SectionPortal>
      </Box>
      {open && (
        <Layer
          modal
          onEsc={() => setOpen(false)}
          onClickOutside={() => setOpen(false)}
        >
          <Box width="35vw">
            <ModalHeader
              text="Add payment source"
              setOpen={setOpen}
            />
            <Box pad="small">
              <CardInputForm
                header="Add another card"
                me={me}
                onCompleted={onCompleted}
              />
            </Box>
          </Box>
        </Layer>
      )}
    </>
  )
}

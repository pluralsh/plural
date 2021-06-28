import React, { useCallback, useContext, useState } from 'react'
import { Elements, CardElement, injectStripe } from 'react-stripe-elements'
import { CurrentUserContext } from '../login/CurrentUser'
import { Box, Text, Stack, Layer } from 'grommet'
import { useMutation, useQuery } from 'react-apollo'
import { REGISTER_CARD, CARDS, DELETE_CARD } from './queries'
import CardDisplay from 'react-credit-cards'
import { Button, HoveredBackground, ModalHeader } from 'forge-core'
import { TagContainer } from '../repos/Tags'
import { Visa, Mastercard, Amex, Trash } from 'grommet-icons'
import { FaCreditCard } from 'react-icons/fa'
import 'react-credit-cards/es/styles-compiled.css';
import './stripe.css'
import './billing.css'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { SectionPortal } from '../Explore'

function _CardForm({stripe, onCompleted}) {
  const [stripeError, setStripeError] = useState(null) 
  const [mutation, {loading, error}] = useMutation(REGISTER_CARD, {
    refetchQueries: [{query: CARDS}],
    onCompleted
  })
  const onClick = useCallback(() => {
    stripe.createToken().then(({token, error}) => {
      setStripeError(error)
      if (token && token.id) return mutation({variables: {source: token.id}})
      console.log(error)
    })
  }, [stripe, mutation])

  return (
    <Box fill='horizontal' pad='small' gap='xsmall' align='center'>
      {stripeError && <Alert header={stripeError.message} status={AlertStatus.ERROR} description='Try again with a different card' />}
      {error && <GqlError error={error} header='Error registering card' />}
      <Box fill='horizontal'>
        <CardElement />
      </Box>
      <Box flex={false} justify='end' fill='horizontal'>
        <Button flex={false} loading={loading} label='Register' onClick={onClick} />
      </Box>
    </Box>
  )
}

const CardForm = injectStripe(_CardForm)

function CardInputForm({me, onCompleted}) {
  return (
    <Elements>
      <CardForm me={me} onCompleted={onCompleted} />
    </Elements>
  )
}

const cardNumber = (last4) => `**** **** **** ${last4}`
const expiry = (expMonth, expYear) => `${expMonth > 10 ? expMonth : '0' + expMonth}/${expYear}`

function CardInner({card: {name, expMonth, expYear, brand, last4}}) {
  return (
    <Box flex={false} width='300px'>
      <CardDisplay
        expiry={expiry(expMonth, expYear)}
        preview
        number={cardNumber(last4)}
        cvc='*'
        issuer={brand}
        name={name || 'John Doe'} />
    </Box>
  )
}

function DeleteCard({card: {id}}) {
  const [mutation, {loading}] = useMutation(DELETE_CARD, {
    variables: {id},
    refetchQueries: [{query: CARDS}]
  })

  return (
    <HoveredBackground>
      <Box
        className='delete'
        accentable
        focusIndicator={false}
        onClick={() => !loading && mutation()}
        margin={{right: 'small', top: 'small'}}
        round='xsmall'
        pad='xsmall'
        background='white'
        align='center'
        justify='center'>
        <Trash size='14px' />
      </Box>
    </HoveredBackground>
  )
}

function Card({card, noDelete}) {
  return (
    <Stack className={'card ' + (noDelete ? 'no-delete' : '')}  width='300px' flex={false} anchor='top-right'>
      <CardInner card={card} />
      <DeleteCard card={card} />
    </Stack>
  )
}

export function CardIcon({brand}) {
  switch (brand.toLowerCase()) {
    case 'visa':
      return <Visa color='focus' size='medium' />
    case 'mastercard':
      return <Mastercard color='focus' size='medium' />
    case 'amex':
      return <Amex color='focus' size='medium' />
    default:
      return <FaCreditCard size='16px' />
  }
}

export function CardOption({card, current, setCurrent}) {
  return (
    <TagContainer pad='small' gap='small' enabled={card.id === current.id} onClick={() => setCurrent(card)}>
      <CardIcon brand={card.brand} />
      <Box>
        <Text size='small'>{cardNumber(card.last4)}</Text>
        <Text size='small' color='dark-3'>{expiry(card.expMonth, card.expYear)}</Text>
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

  const {edges} = data.me.cards

  return (
    <>
    <Box fill pad='medium'>
      {edges.map(({node: card}) => <Card key={card.id} card={card} />)}
      <SectionPortal>
        <Button label='Add a card' onClick={() => setOpen(true)} />
      </SectionPortal>
    </Box>
    {open && (
      <Layer modal onEsc={() => setOpen(false)} onClickOutside={() => setOpen(false)}>
        <Box width='35vw'>
          <ModalHeader text='Add payment source' setOpen={setOpen} />
          <Box pad='small'>
            <CardInputForm
              header='Add another card'
              me={me}
              onCompleted={onCompleted} />
          </Box>
        </Box>
      </Layer>
    )}
    </>
  )
}

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

function _CardForm({stripe, onCompleted}) {
  const [mutation, {loading}] = useMutation(REGISTER_CARD, {
    refetchQueries: [{query: CARDS}],
    onCompleted
  })
  const onClick = useCallback(() => {
    stripe.createToken().then(({token: {id}}) =>
      mutation({variables: {source: id}})
    )
  }, [stripe, mutation])

  return (
    <Box fill='horizontal' direction='row' pad='small' gap='xsmall' align='center'>
      <Box fill='horizontal'>
        <CardElement />
      </Box>
      <Box flex={false}>
        <Button loading={loading} label='Register' onClick={onClick} />
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
    <CardDisplay
      expiry={expiry(expMonth, expYear)}
      preview
      number={cardNumber(last4)}
      cvc='*'
      issuer={brand}
      name={name || 'John Doe'} />
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
        accentable
        focusIndicator={false}
        onClick={() => !loading && mutation()}
        margin={{top: 'xsmall', right: 'xsmall'}}
        round='xsmall'
        pad='small'
        background='white'
        align='center'
        justify='center'>
        <Trash size='14px' />
      </Box>
    </HoveredBackground>
  )
}

function Card({card, noDelete}) {
  const [hover, setHover] = useState(false)

  if (hover && !noDelete) {
    return (
      <Stack anchor='top-right' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <CardInner card={card} />
        <DeleteCard card={card} />
      </Stack>
    )
  }

  return (
    <Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <CardInner card={card} />
    </Box>
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
  const {data, loading} = useQuery(CARDS)
  if (!data || loading) return null

  const {edges} = data.me.cards

  return (
    <>
    <Box fill pad='medium'>
      <Box flex={false} direction='row' fill='horizontal' pad='small'>
        <Button label='Add a card' onClick={() => setOpen(true)} />
      </Box>
      <Box fill align='center' pad='small' style={{overflow: 'auto'}} gap='small'>
        {edges.map(({node: card}) => <Card card={card} />)}
      </Box>
    </Box>
    {open && (
      <Layer modal onEsc={() => setOpen(false)} onClickOutside={() => setOpen(false)}>
        <Box width='35vw'>
          <ModalHeader text='Add payment source' setOpen={setOpen} />
          <Box pad='small'>
            <CardInputForm header='Add another card' me={me} onCompleted={() => setOpen(false)} />
          </Box>
        </Box>
      </Layer>
    )}
    </>
  )
}

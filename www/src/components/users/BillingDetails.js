import React, { useContext, useState } from 'react'
import {Elements, CardElement, injectStripe} from 'react-stripe-elements'
import { CurrentUserContext } from '../login/CurrentUser'
import { Box, Text, Stack } from 'grommet'
import { useMutation, useQuery } from 'react-apollo'
import { REGISTER_CARD, CARDS, DELETE_CARD } from './queries'
import CardDisplay from 'react-credit-cards'
import 'react-credit-cards/es/styles-compiled.css';
import './stripe.css'

import Button from '../utils/Button'
import { TagContainer } from '../repos/Tags'
import { TOOLBAR_SIZE } from '../Chartmart'
import { Visa, Mastercard, Amex, Trash } from 'grommet-icons'
import { FaCreditCard } from 'react-icons/fa'
import HoveredBackground from '../utils/HoveredBackground'

function _CardForm({stripe, header, onCompleted}) {
  const [mutation, {loading}] = useMutation(REGISTER_CARD, {
    refetchQueries: [{query: CARDS}],
    onCompleted
  })
  const onClick = () => stripe.createToken().then(({token: {id}}) =>
    mutation({variables: {source: id}})
  )
  return (
    <Box width='100%' height='100%' align='center' justify='center'>
      <Box width='50%' gap='small'>
        <Text size='small' weight='bold'>{header ? header : 'Enter your payment information'}</Text>
        <Box pad='small' gap='xsmall' elevation='small'>
          <CardElement />
          <Box direction='row' justify='end'>
            <Button
              loading={loading}
              pad='small'
              round='xsmall'
              label='Register'
              onClick={onClick} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const CardForm = injectStripe(_CardForm)

function CardInputForm({me, header, onCompleted}) {
  return (
    <Elements>
      <CardForm me={me} header={header} onCompleted={onCompleted} />
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
        style={{cursor: 'pointer'}}
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

function CardIcon({brand}) {
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

function CardOption({card, current, setCurrent}) {
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

export function Cards({me}) {
  const [current, setCurrent] = useState(null)
  const {data, loading} = useQuery(CARDS)
  if (!data || loading) return null

  const {edges} = data.me.cards
  const card = current || edges[0].node
  return (
    <Box direction='row' height={`calc(100vh - ${TOOLBAR_SIZE})`}>
      <Box width='250px' background='light-1' style={{height: '100%', scroll: 'auto'}} elevation='small'>
        {edges.map(({node}) => (
          <CardOption
            key={node.id}
            card={node}
            setCurrent={setCurrent}
            current={card} />
        ))}
      </Box>
      <Box pad='medium' gap='small' width='100%'>
        <Box fill='horizontal' align='center'>
          <Box width='290px'>
            <Card card={card} noDelete={edges.length <= 1} />
          </Box>
        </Box>
        <Box border='top' pad='medium'>
          <CardInputForm header='Add another card' me={me} />
        </Box>
      </Box>
    </Box>
  )
}

export default function BillingDetails() {
  const me = useContext(CurrentUserContext)

  if (me.customerId) return <Cards me={me} />
  return (
    <Box pad='small'>
      <CardInputForm me={me} />
    </Box>
  )
}
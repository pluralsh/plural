import React, { useContext } from 'react'
import {Elements, CardElement, injectStripe} from 'react-stripe-elements'
import { CurrentUserContext } from '../login/CurrentUser'
import { Box, Text } from 'grommet'
import { useMutation } from 'react-apollo'
import { REGISTER_CARD, ME_Q } from './queries'

import './stripe.css'
import Button from '../utils/Button'

function _CardForm({stripe}) {
  const [mutation, {loading}] = useMutation(REGISTER_CARD)
  const onClick = () => stripe.createToken().then(({token: {id}}) =>
    mutation({variables: {source: id}})
  )
  return (
    <Box width='100%' height='100%' align='center' justify='center'>
      <Box width='50%' gap='small'>
        <Text size='small' weight='bold'>Enter your payment information</Text>
        <Box pad='small' gap='xsmall' elevation='small'>
          <label>
            Card Details
            <CardElement />
          </label>
          <Button loading={loading} pad='small' round='xsmall' label='Register' onClick={onClick} />
        </Box>
      </Box>
    </Box>
  )
}

const CardForm = injectStripe(_CardForm)

function Completed() {
  return (
    <Box pad='small'>
      <Text>You've already uploaded your payment information</Text>
    </Box>
  )
}

export default function BillingDetails() {
  const me = useContext(CurrentUserContext)

  return (
    <Box pad='small'>
      <Elements>
        {me.customerId ? <Completed /> : <CardForm me={me}/>}
      </Elements>
    </Box>
  )
}
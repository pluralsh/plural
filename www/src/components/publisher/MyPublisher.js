import React, {useContext, useEffect, useState} from 'react'
import {useMutation} from 'react-apollo'
import {Box, Anchor} from 'grommet'
import Repositories from '../repos/Repositories'
import CreateRepository from '../repos/CreateRepository'
import {CurrentUserContext} from '../login/CurrentUser'
import {BreadcrumbContext} from '../Chartmart'
import Expander from '../utils/Expander'
import { EDIT_PUBLISHER, LINK_ACCOUNT } from './queries'
import { ME_Q } from '../users/queries'
import InputField from '../utils/InputField'
import Button from '../utils/Button'
import ScrollableContainer from '../utils/ScrollableContainer'
import { CONNECT_ICON, AUTHORIZE_URL } from './constants'
import { Stripe } from 'grommet-icons'
import { STRIPE_BLUE } from '../payments/constants'

function AccountConnected() {
  return (
    <Box pad='small' justify='center' align='center' direction='row' gap='xsmall'>
      <Stripe color={STRIPE_BLUE} size='medium' />
      <Anchor href='https://dashboard.stripe.com/' size='small'>stripe dashboard</Anchor>
    </Box>
  )
}

function PublisherPayments({accountId}) {
  const [mutation] = useMutation(LINK_ACCOUNT, {
    update: (cache, {data: { linkPublisher }}) => {
      const prev = cache.readQuery({ query: ME_Q })
      cache.writeQuery({query: ME_Q, data: {
        ...prev, me: {
          ...prev.me,
          publisher: linkPublisher
        }
      }})
    }
  })
  const params = new URLSearchParams(window.location.search);
  const token = params.get('code')

  useEffect(() => {
    if (token && !accountId) {
      mutation({variables: {token}})
    }
  }, [token, accountId, mutation])

  return (
    <Box pad='small' align='center' justify='center'>
      <a href={AUTHORIZE_URL}>
        <img alt='' src={CONNECT_ICON} />
      </a>
    </Box>
  )
}

function EditPublisher({description}) {
  const [attributes, setAttributes] = useState({description})
  const [mutation] = useMutation(EDIT_PUBLISHER, {
    variables: {attributes},
    update: (cache, { data: { updatePublisher } }) => {
      const prev = cache.readQuery({ query: ME_Q })
      cache.writeQuery({query: ME_Q, data: {
        ...prev, me: {
          ...prev.me,
          publisher: updatePublisher
        }
      }})
    }
  })

  return (
    <Box gap='small' pad='small'>
      <InputField
        label='description'
        labelWidth='85px'
        value={attributes.description}
        onChange={(e) => setAttributes({...attributes, description: e.target.value})} />
      <Box direction='row' justify='end'>
        <Button round='xsmall' label='Update' onClick={mutation} />
      </Box>
    </Box>
  )
}

export default function MyPublisher() {
  const me = useContext(CurrentUserContext)
  const {setBreadcrumbs} = useContext(BreadcrumbContext)
  useEffect(() => {
    if (!me.publisher) return
    setBreadcrumbs([{url: `/publishers/${me.publisher.id}`, text: me.publisher.name}])
  }, [me, setBreadcrumbs])

  return (
    <ScrollableContainer>
      <Box direction='row' pad='medium'>
        <Box width='60%'>
          <Repositories publisher={me.publisher} deletable columns={2} />
        </Box>
        <Box width='40%' elevation='small'>
          <Box>
            {me.publisher.accountId && <AccountConnected />}
            <Expander text='Edit publisher'>
              <EditPublisher {...me.publisher} />
            </Expander>
            {!me.publisher.accountId && (
              <Expander text='Payments'>
                <PublisherPayments {...me.publisher} />
              </Expander>
            )}
            <Box border='top'>
              <Expander text='Create Repository' open>
                <CreateRepository publisher={me.publisher} />
              </Expander>
            </Box>
          </Box>
        </Box>
      </Box>
    </ScrollableContainer>
  )
}
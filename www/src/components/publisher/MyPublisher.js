import React, { useContext, useEffect, useState } from 'react'
import { useMutation } from 'react-apollo'
import { InputField, InputCollection, ResponsiveInput, Button } from 'forge-core'
import { Box, Anchor, Text, TextInput } from 'grommet'
import Repositories from '../repos/Repositories'
import CreateRepository from '../repos/CreateRepository'
import { CurrentUserContext } from '../login/CurrentUser'
import { EDIT_PUBLISHER, LINK_ACCOUNT } from './queries'
import { ME_Q } from '../users/queries'
import { CONNECT_ICON, AUTHORIZE_URL } from './constants'
import { Add, Edit, List, Stripe } from 'grommet-icons'
import { STRIPE_BLUE } from '../payments/constants'
import { EditContent, EditSelect } from '../users/EditUser'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { SIDEBAR_WIDTH } from '../constants'
import { PublisherHeader } from './Publisher'
import { useParams } from 'react-router'
import { deepUpdate, updateCache } from '../../utils/graphql'

function AccountConnected() {
  return (
    <Box pad='xsmall' align='center' direction='row' gap='xsmall' round='xsmall'>
      <Stripe color={STRIPE_BLUE} size='medium' />
      <Anchor href='https://dashboard.stripe.com/' size='small'>stripe dashboard</Anchor>
    </Box>
  )
}

function PublisherPayments({publisher: {billingAccountId}}) {
  const [mutation] = useMutation(LINK_ACCOUNT, {
    update: (cache, {data: { linkPublisher }}) => updateCache(cache, {
      query: ME_Q,
      update: (prev) => deepUpdate(prev, 'me.publisher', () => linkPublisher)
    })
  })
  const params = new URLSearchParams(window.location.search);
  const token = params.get('code')

  useEffect(() => {
    if (token && !billingAccountId) {
      mutation({variables: {token}})
    }
  }, [token, billingAccountId, mutation])

  return (
    <Box pad='small' round='xsmall'>
      <a href={AUTHORIZE_URL}>
        <img alt='' src={CONNECT_ICON} />
      </a>
    </Box>
  )
}

function AddressForm({address, onChange}) {
  return (
    <Box pad={{horizontal: 'small'}}>
      <InputCollection>
        <ResponsiveInput
          label='line 1'
          value={address.line1}
          placeholder='street address'
          onChange={({target: {value}}) => onChange({...address, line1: value})} />
        <ResponsiveInput
          label='line 2'
          value={address.line2}
          placeholder='apt number, suite number, etc'
          onChange={({target: {value}}) => onChange({...address, line2: value})} />
        <ResponsiveInput
          label='city'
          value={address.city}
          placeholder='city'
          onChange={({target: {value}}) => onChange({...address, city: value})} />
        <ResponsiveInput
          label='state'
          value={address.state}
          placeholder='state'
          onChange={({target: {value}}) => onChange({...address, state: value})} />
        <tr>
          <td>
            <Text size='small' weight='bold'>country</Text>
          </td>
          <td>
            <Box direction='row' gap='small'>
              <TextInput
                label='country'
                value={address.country}
                placeholder='country'
                onChange={({target: {value}}) => onChange({...address, country: value})} />
              <InputField
                label='zip'
                value={address.zip}
                labelWidth='30px'
                placeholder='zip'
                onChange={({target: {value}}) => onChange({...address, zip: value})} />
            </Box>
          </td>
        </tr>
      </InputCollection>
    </Box>
  )
}

const defaultAddress = {line1: '', line2: '', city: '', state: '', zip: '', country: 'United States'}

function EditPublisher({publisher: {description, phone, address: {__typename, ...address}}}) {
  const [attributes, setAttributes] = useState({description, phone, address: (address || defaultAddress)})
  const [mutation, {loading}] = useMutation(EDIT_PUBLISHER, {
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
      <Box pad={{horizontal: 'small'}}>
        <InputCollection>
          <ResponsiveInput
            label='description'
            value={attributes.description}
            onChange={({target: {value}}) => setAttributes({...attributes, description: value})} />
          <ResponsiveInput
            label='phone'
            value={attributes.phone}
            onChange={({target: {value}}) => setAttributes({...attributes, phone: value})} />
        </InputCollection>
      </Box>
      <Box border='top' pad={{top: 'small'}} gap='small'>
        <Text size='small' margin={{left: 'small'}} weight={500}>Address</Text>
        <AddressForm
          address={attributes.address}
          onChange={(address) => setAttributes({...attributes, address})} />
      </Box>
      <Box direction='row' justify='end' pad={{horizontal: '16px'}}>
        <Button
          loading={loading}
          pad={{horizontal: 'medium', vertical: 'xsmall'}}
          round='xsmall'
          label='Update'
          onClick={mutation} />
      </Box>
    </Box>
  )
}

export default function MyPublisher() {
  const {editing} = useParams()
  const me = useContext(CurrentUserContext)
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    if (!me.publisher) return
    setBreadcrumbs([
      {url: `/publishers/${me.publisher.id}`, text: me.publisher.name},
      {url: `/publishers/${me.publisher.id}/${editing}`, text: editing}
    ])
  }, [me, setBreadcrumbs, editing])

  return (
    <Box fill direction='row'>
      <Box width={SIDEBAR_WIDTH} flex={false} pad='small' gap='xsmall' background='backgroundColor'>
        <PublisherHeader publisher={{...me.publisher, owner: me}} size='60px' />
        <EditSelect base='/publishers/mine/' edit='repos' name='Repositories' icon={<List size='small' />} />
        <EditSelect base='/publishers/mine/' edit='attrs' name='Edit Attributes' icon={<Edit size='small' />} />
        <EditSelect base='/publishers/mine/' edit='create' name='Create Repository' icon={<Add size='small' />} />
        {me.publisher.billingAccountId && <AccountConnected />}
        {!me.publisher.billingAccountId && (<PublisherPayments {...me.publisher} />)}
      </Box>
      <Box fill style={{overflow: 'auto'}} pad='small'>
        <EditContent edit='repos'>
          <Repositories publisher={me.publisher} deletable columns={2} />
        </EditContent>
        <EditContent edit='attrs'>
          <EditPublisher publisher={me.publisher} />
        </EditContent>
        <EditContent edit='create'>
          <CreateRepository publisher={me.publisher} />
        </EditContent>
      </Box>
    </Box>
  )
}
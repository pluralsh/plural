import React, { useContext, useEffect, useState } from 'react'
import { useMutation } from 'react-apollo'
import { InputCollection, ResponsiveInput, Button } from 'forge-core'
import { Box, Anchor, Text } from 'grommet'
import Repositories from '../repos/Repositories'
import CreateRepository from '../repos/CreateRepository'
import { CurrentUserContext, PluralConfigurationContext } from '../login/CurrentUser'
import { EDIT_PUBLISHER, LINK_ACCOUNT } from './queries'
import { ME_Q } from '../users/queries'
import { CONNECT_ICON, AUTHORIZE_URL } from './constants'
import { Add, Edit, List, Stripe } from 'grommet-icons'
import { STRIPE_BLUE } from '../payments/constants'
import { EditContent, EditSelect } from '../users/EditUser'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { SIDEBAR_WIDTH } from '../constants'
import { useParams } from 'react-router'
import { useFilePicker } from 'react-sage'
import { deepUpdate, updateCache } from '../../utils/graphql'
import Avatar from '../users/Avatar'
import { SectionPortal } from '../Explore'

function AccountConnected() {
  return (
    <Box pad='xsmall' align='center' direction='row' gap='xsmall' round='xsmall'>
      <Stripe color={STRIPE_BLUE} size='medium' />
      <Anchor href='https://dashboard.stripe.com/' size='small'>stripe dashboard</Anchor>
    </Box>
  )
}

function PublisherPayments({publisher: {billingAccountId}}) {
  const {stripeConnectId} = useContext(PluralConfigurationContext)
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
      <a href={AUTHORIZE_URL.replace('{connect_id}', stripeConnectId)}>
        <img alt='' src={CONNECT_ICON} />
      </a>
    </Box>
  )
}

function EditPublisher({publisher: {description, phone}}) {
  const [attributes, setAttributes] = useState({description, phone})
  const [mutation, {loading}] = useMutation(EDIT_PUBLISHER, {variables: {attributes}})

  return (
    <Box fill gap='small' pad='small'>
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
      <SectionPortal>
        <Button
          loading={loading}
          pad={{horizontal: 'medium', vertical: 'xsmall'}}
          round='xsmall'
          label='Update'
          onClick={mutation} />
      </SectionPortal>
    </Box>
  )
}

function EditAvatar({publisher}) {
  const {files, onClick, HiddenFileInput} = useFilePicker({})
  const [mutation] = useMutation(EDIT_PUBLISHER)
  useEffect(() => {
    if (files.length > 0) {
      mutation({variables: {attributes: {avatar: files[0]}}})
    }
  }, [files])
  console.log(publisher)

  return (
    <Box direction='row' align='center' gap='medium' pad='small'>
      <>
      <Avatar size='60px' user={publisher} onClick={onClick} />
      <HiddenFileInput accept='.jpg, .jpeg, .png' multiple={false} />
      </>
      <Box gap='small'>
        <Box>
          <Text size='medium' weight={500}>{publisher.name}</Text>
          <Text size='small'><i>{publisher.description}</i></Text>
        </Box>
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
        <EditAvatar publisher={me.publisher} />
        <EditSelect base='/publishers/mine/' edit='repos' name='Repositories' icon={<List size='small' />} />
        <EditSelect base='/publishers/mine/' edit='attrs' name='Edit Attributes' icon={<Edit size='small' />} />
        <EditSelect base='/publishers/mine/' edit='create' name='Create Repository' icon={<Add size='small' />} />
        {me.publisher.billingAccountId && <AccountConnected />}
        {!me.publisher.billingAccountId && (<PublisherPayments publisher={me.publisher} />)}
      </Box>
      <Box fill style={{overflow: 'auto'}}>
        <EditContent edit='repos' name='Repositories'>
          <Repositories publisher={me.publisher} deletable columns={2} />
        </EditContent>
        <EditContent edit='attrs' name='Edit Attributes'>
          <EditPublisher publisher={me.publisher} />
        </EditContent>
        <EditContent edit='create' name='Create Repository'>
          <CreateRepository publisher={me.publisher} />
        </EditContent>
      </Box>
    </Box>
  )
}
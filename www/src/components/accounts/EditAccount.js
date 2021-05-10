import React, { useContext, useEffect, useState } from 'react'
import { Box, Text } from 'grommet'
import { SIDEBAR_WIDTH } from '../constants'
import { SectionChoice } from '../utils/SectionChoice'
import { useHistory, useParams } from 'react-router'
import { Edit, Group, Network, Robot, Script, User } from 'grommet-icons'
import { useMutation } from 'react-apollo'
import { UPDATE_ACCOUNT } from './queries'
import { Button, InputCollection, ResponsiveInput } from 'forge-core'
import { EditHeader } from '../users/EditUser'
import { CurrentUserContext } from '../login/CurrentUser'
import { Groups, Roles, Users } from './Directory'
import Avatar from '../users/Avatar'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { FaCreditCard, FaReceipt } from 'react-icons/fa'
import { CardList } from '../users/BillingDetails'
import Invoices from '../payments/Invoices'
import { OAuthIntegrations } from '../integrations/OAuthIntegrations'
import { ServiceAccounts } from './ServiceAccounts'

const ICON_SIZE = '12px'

const ViewOptions = {
  EDIT: 'attributes',
  USERS: 'users',
  SRV_ACCTS: 'service-accounts',
  GROUPS: 'groups',
  ROLES: 'roles',
  METHODS: 'methods',
  INVOICES: 'invoices',
  INTEGRATIONS: 'integrations'
}

const VIEWS = [
  {text: 'Edit Attributes', view: ViewOptions.EDIT, icon: <Edit size={ICON_SIZE} />},
  {text: "Users", view: ViewOptions.USERS, icon: <User size={ICON_SIZE} />},
  {text: "Service Accounts", view: ViewOptions.SRV_ACCTS, icon: <Robot size={ICON_SIZE} />},
  {text: "Groups", view: ViewOptions.GROUPS, icon: <Group size={ICON_SIZE} />},
  {text: 'Roles', view: ViewOptions.ROLES, icon: <Script size={ICON_SIZE} />},
  {text: 'Payment Methods', view: ViewOptions.METHODS, icon: <FaCreditCard size={ICON_SIZE} />},
  {text: 'Invoices', view: ViewOptions.INVOICES, icon: <FaReceipt size={ICON_SIZE} />},
  {text: 'OAuth Integrations', view: ViewOptions.INTEGRATIONS, icon: <Network size={ICON_SIZE} />},
]

function EditAttributes() {
  const {account} = useContext(CurrentUserContext)
  const [attributes, setAttributes] = useState({name: account.name})
  const [mutation, {loading}] = useMutation(UPDATE_ACCOUNT, {variables: {attributes}})

  return (
    <Box fill pad={{horizontal: 'small', vertical: 'medium'}} gap='xsmall'>
      <EditHeader text='Edit Attributes' />
      <InputCollection>
        <ResponsiveInput
          value={attributes.name}
          label='name'
          onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
      </InputCollection>
      <Box direction='row' justify='end'>
        <Button label='Update' loading={loading} onClick={mutation} />
      </Box>
    </Box>
  )
}

export function EditAccount({billing}) {
  const {account} = useContext(CurrentUserContext)
  let history = useHistory()
  const {section} = useParams()
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {    
    const prefix = billing ? '/accounts/billing' : '/accounts/edit'
    setBreadcrumbs([
      {text: 'account', url: '/accounts/edit/attributes'},
      {text: section, url: `${prefix}/${section}`}
    ])
  }, [setBreadcrumbs, section, billing])

  return (
    <Box fill direction='row'>
      <Box gap='xsmall' flex={false} width={SIDEBAR_WIDTH} height='100%' background='backgroundColor' pad='small'>
        <Box pad={{vertical: 'small'}} direction='row' align='center' gap='small'>
          <Avatar user={account} size='40px' />
          <Text size='small'>{account.name}</Text>
        </Box>
        {VIEWS.map(({text, view, icon}) => (
          <SectionChoice
            key={view}
            selected={section === view}
            label={text}
            icon={icon}
            onClick={() => history.push(`/accounts/edit/${view}`)} />
        ))}
      </Box>
      <Box fill>
        {section === ViewOptions.EDIT && <EditAttributes />}
        {section === ViewOptions.USERS && <Users />}
        {section === ViewOptions.SRV_ACCTS && <ServiceAccounts />}
        {section === ViewOptions.GROUPS && <Groups />}
        {section === ViewOptions.ROLES && <Roles />}
        {section === ViewOptions.METHODS && <CardList />}
        {section === ViewOptions.INVOICES && <Invoices />}
        {section === ViewOptions.INTEGRATIONS && <OAuthIntegrations />}
      </Box>
    </Box>
  )
}
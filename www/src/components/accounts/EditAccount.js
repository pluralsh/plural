import {
  useContext, useEffect,
} from 'react'
import {
  Box, ThemeContext,
} from 'grommet'

import { useParams } from 'react-router-dom'

import { BreadcrumbsContext } from '../Breadcrumbs'
import { CardList } from '../users/BillingDetails'
import Invoices from '../payments/Invoices'
import { OAuthIntegrations } from '../integrations/OAuthIntegrations'

import { SectionContentContainer } from '../Explore'

import { DnsDirectory } from './Domains'

const ViewOptions = {
  EDIT: 'attributes',
  USERS: 'users',
  SRV_ACCTS: 'service-accounts',
  GROUPS: 'groups',
  ROLES: 'roles',
  METHODS: 'methods',
  INVOICES: 'invoices',
  INTEGRATIONS: 'integrations',
  DOMAINS: 'domains',
  INVITES: 'invites',
}

// eslint-disable-next-line
export const sanitize = ({ __typename, ...rest }) => rest

export const canEdit = ({ roles, id }, { rootUser }) => (
  (roles && roles.admin) || id === rootUser.id
)

export const hasRbac = ({ boundRoles }, role) => (boundRoles || []).some(({ permissions }) => !!permissions[role])

export function EditAccount({ billing }) {
  const { section } = useParams()
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)

  useEffect(() => {
    const prefix = billing ? '/accounts/billing' : '/accounts/edit'

    setBreadcrumbs([
      { text: 'account', url: '/accounts/edit/attributes' },
      { text: section, url: `${prefix}/${section}` },
    ])
  }, [setBreadcrumbs, section, billing])

  return (
    <ThemeContext.Extend value={{ global: { input: { padding: '9px' } } }}>
      <Box fill>
        {section === ViewOptions.DOMAINS && <DnsDirectory />}
        {section === ViewOptions.METHODS && (
          <SectionContentContainer header="Payment Methods">
            <CardList />
          </SectionContentContainer>
        )}
        {section === ViewOptions.INVOICES && (
          <SectionContentContainer header="Invoices">
            <Invoices />
          </SectionContentContainer>
        )}
        {section === ViewOptions.INTEGRATIONS && (
          <SectionContentContainer header="OAuth Integrations">
            <OAuthIntegrations />
          </SectionContentContainer>
        )}
      </Box>
    </ThemeContext.Extend>
  )
}

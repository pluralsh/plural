import {
  useContext, useEffect,
} from 'react'
import {
  Box, ThemeContext,
} from 'grommet'

import { useParams } from 'react-router-dom'

import { BreadcrumbsContext } from '../Breadcrumbs'

import Invoices from '../payments/Invoices'
import { OAuthIntegrations } from '../integrations/OAuthIntegrations'

import { SectionContentContainer } from '../Explore'

import { CardList } from './BillingDetails'

const ViewOptions = {
  METHODS: 'methods',
  INVOICES: 'invoices',
  INTEGRATIONS: 'integrations',
}

export const canEdit = ({ roles, id }, { rootUser }) => (
  (roles && roles.admin) || id === rootUser.id
)

export function EditAccount({ billing }: any) {
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

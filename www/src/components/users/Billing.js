import { Box } from 'grommet'
import { useContext, useEffect } from 'react'
import { FaCreditCard, FaReceipt } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'

import { BreadcrumbsContext } from '../Breadcrumbs'
import { SIDEBAR_WIDTH } from '../constants'
import Invoices from '../payments/Invoices'
import { SectionChoice } from '../utils/SectionChoice'

import { CardList } from './BillingDetails'

const ICON_SIZE = '12px'

const ViewOptions = {
  METHODS: 'methods',
  INVOICES: 'invoices',
}

const VIEWS = [
  { text: 'Payment Methods', view: ViewOptions.METHODS, icon: <FaCreditCard size={ICON_SIZE} /> },
  { text: 'Invoices', view: ViewOptions.INVOICES, icon: <FaReceipt size={ICON_SIZE} /> },
]

export function Billing() {
  const { section } = useParams()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => setBreadcrumbs([
    { text: 'billing', url: '/billing/methods' },
    { text: section, url: `/billing/${section}` },
  ]), [section, setBreadcrumbs])

  return (
    <Box
      fill
      direction="row"
    >
      <Box
        gap="xsmall"
        flex={false}
        width={SIDEBAR_WIDTH}
        height="100%"
        border={{ side: 'right', color: 'border' }}
        pad="small"
      >
        {VIEWS.map(({ text, view, icon }) => (
          <SectionChoice
            selected={section === view}
            label={text}
            icon={icon}
            onClick={() => navigate(`/billing/${view}`)}
          />
        ))}
      </Box>
      <Box fill>
        {section === ViewOptions.METHODS && <CardList />}
        {section === ViewOptions.INVOICES && <Invoices />}
      </Box>
    </Box>
  )
}

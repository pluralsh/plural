import { CheckIcon, CloseIcon } from '@pluralsh/design-system'
import styled from 'styled-components'

import { ReactNode } from 'react'

import { EnterprisePlanCTA, ProPlanCTA } from './BillingManagePlan'

export default function BillingPricingTable({
  onUpgrade,
  onCancel,
}: {
  onUpgrade: () => void
  onCancel: () => void
}) {
  const plans = getPlans({
    proPlanCTA: (
      <ProPlanCTA
        onUpgrade={onUpgrade}
        onCancel={onCancel}
      />
    ),
    enterprisePlanCTA: <EnterprisePlanCTA />,
  })

  return (
    <TableSC>
      <colgroup>
        <col style={{ width: 'fit-content' }} />
        {plans.map((plan) => (
          <col
            // makes the label column a little smaller than the others
            style={{ width: `${100 / (plans.length + 0.75)}%` }}
            key={plan.name}
          />
        ))}
      </colgroup>
      <thead>
        <tr>
          <TableHeaderCellSC />
          {plans.map((plan) => (
            <TableHeaderCellSC key={plan.name}>{plan.name}</TableHeaderCellSC>
          ))}
        </tr>
      </thead>
      <TableBodySC>
        {rows.map((rowLabel) => (
          <tr key={rowLabel}>
            <TableCellSC>{rowLabel !== 'action' && rowLabel}</TableCellSC>
            {plans.map((plan) => (
              <TableCellSC key={plan.name}>{plan.values[rowLabel]}</TableCellSC>
            ))}
          </tr>
        ))}
      </TableBodySC>
    </TableSC>
  )
}

const CheckIconSC = styled(CheckIcon).attrs(() => ({
  color: 'icon-success',
}))``

const TableSC = styled.table(({ theme }) => ({
  tableLayout: 'fixed',
  width: '100%',
  background: theme.colors['fill-one'],
  borderSpacing: 0,
  borderRadius: theme.borderRadiuses.medium,
  border: theme.borders.default,
  '& th, & td': {
    borderBottom: theme.borders.default,
    borderRight: theme.borders.default,
    // targets last cell in each row
    '&:last-child': {
      borderRight: 'none',
    },
  },
  // targets each cell in last row
  '& tr:last-child td': {
    borderBottom: 'none',
  },
}))

const TableBodySC = styled.tbody(({ theme }) => ({
  '& tr:nth-child(odd)': {
    backgroundColor: theme.colors['fill-one-selected'],
  },
}))

const TableHeaderCellSC = styled.th(({ theme }) => ({
  ...theme.partials.text.subtitle2,
  padding: `${theme.spacing.xlarge}px ${theme.spacing.large}px`,
  textAlign: 'left',
}))

const TableCellSC = styled.td(({ theme }) => ({
  ...theme.partials.text.body2,
  padding: `${theme.spacing.medium}px ${theme.spacing.large}px`,
  color: theme.colors['text-xlight'],
  whiteSpace: 'pre-wrap',
}))

const rows = [
  'Clusters',
  'Hosting',
  'SLA',
  'SLA Response',
  'Communication',
  'Success Team',
  'Customized Training',
  'Multi-cluster Deployment',
  'CD Pipelines',
  'IaC Management',
  'PR Automations',
  'Git Integrations',
  'Policy Management',
  'GDPR Compliant',
  'SOC 2 Compliant',
  'action', // not shown but used for bottom button
]

const getPlans = ({
  proPlanCTA,
  enterprisePlanCTA,
}: {
  proPlanCTA: ReactNode
  enterprisePlanCTA: ReactNode
}) => [
  {
    name: 'Pro Plan',
    values: {
      Clusters: 'Up to 10',
      Hosting: 'Plural shared infrastructure',
      SLA: '99.9% uptime',
      'SLA Response': '1 business day response',
      Communication: 'Email support',
      'Success Team': <CloseIcon />,
      'Customized Training': <CloseIcon />,
      'Multi-cluster Deployment': <CheckIconSC />,
      'CD Pipelines': <CheckIconSC />,
      'IaC Management': <CheckIconSC />,
      'PR Automations': <CheckIconSC />,
      'Git Integrations': <CheckIconSC />,
      'Policy Management': <CheckIconSC />,
      'GDPR Compliant': <CheckIconSC />,
      'SOC 2 Compliant': <CheckIconSC />,
      action: proPlanCTA,
    },
  },
  {
    name: 'Enterprise',
    values: {
      Clusters: 'Unlimited',
      Hosting: 'Shared, dedicated, or on-prem infrastructure',
      SLA: '99.9% uptime',
      'SLA Response': '1 hour guaranteed response',
      Communication: 'Dedicated Slack or Teams\nOn-demand Calls',
      'Success Team': <CheckIconSC />,
      'Customized Training': <CheckIconSC />,
      'Multi-cluster Deployment': <CheckIconSC />,
      'CD Pipelines': <CheckIconSC />,
      'IaC Management': <CheckIconSC />,
      'PR Automations': <CheckIconSC />,
      'Git Integrations': <CheckIconSC />,
      'Policy Management': <CheckIconSC />,
      'GDPR Compliant': <CheckIconSC />,
      'SOC 2 Compliant': <CheckIconSC />,
      action: enterprisePlanCTA,
    },
  },
]

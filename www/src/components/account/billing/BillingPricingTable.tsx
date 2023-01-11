import { Div } from 'honorable'
import { CheckIcon, CloseIcon } from '@pluralsh/design-system'

const columnStyles = {
  position: 'relative',
  boxShadow: '-12px 0 12px 0px rgb(14 16 21 / 20%)',
  ':first-child': {
    boxShadow: 'none',
    '> div': {
      display: 'flex',
      justifyContent: 'flex-end',
      textAlign: 'right',
    },
  },
  '> div': {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    height: 52,
    borderTop: '1px solid border-fill-two',
  },
  '> div:nth-child(even)': {
    backgroundColor: 'fill-two',
  },
  '> div:nth-child(odd)': {
    backgroundColor: 'fill-one',
  },
  '> div:first-child': {
    height: 96,
  },
}

const firstColumnCellProps = {
  body2: true,
  borderLeft: '1px solid border-fill-two',
}

function BillingPricingTable() {
  return (
    <Div
      display="grid"
      gridTemplateColumns="repeat(4, 1fr)"
    >
      <Div {...columnStyles}>
        <Div
          backgroundColor="transparent !important"
          borderTop="none !important"
        />
        <Div
          {...firstColumnCellProps}
          borderTopLeftRadius={6}
        >
          Clusters
        </Div>
        <Div {...firstColumnCellProps}>
          Apps
        </Div>
        <Div {...firstColumnCellProps}>
          User accounts
        </Div>
        <Div {...firstColumnCellProps}>
          Roles
        </Div>
        <Div {...firstColumnCellProps}>
          Groups
        </Div>
        <Div {...firstColumnCellProps}>
          Service accounts
        </Div>
        <Div {...firstColumnCellProps}>
          Discord Forum
        </Div>
        <Div {...firstColumnCellProps}>
          Access to community engineers
        </Div>
        <Div {...firstColumnCellProps}>
          Private Slack Connect to Plural engineers
        </Div>
        <Div {...firstColumnCellProps}>
          Dedicated support engineer
        </Div>
        <Div {...firstColumnCellProps}>
          Onboarding
        </Div>
        <Div {...firstColumnCellProps}>
          Emergency Hotfixes
        </Div>
        <Div {...firstColumnCellProps}>
          SLAs
        </Div>
        <Div {...firstColumnCellProps}>
          Coverage
        </Div>
        <Div {...firstColumnCellProps}>
          Enforced SSO
        </Div>
        <Div {...firstColumnCellProps}>
          VPN
        </Div>
        <Div {...firstColumnCellProps}>
          Audit log
        </Div>
        <Div {...firstColumnCellProps}>
          SOC 2
        </Div>
        <Div {...firstColumnCellProps}>
          GDPR
        </Div>
        <Div {...firstColumnCellProps}>
          Compliance reports
        </Div>
        <Div {...firstColumnCellProps}>
          Training
        </Div>
        <Div {...firstColumnCellProps}>
          Developer support
        </Div>
        <Div {...firstColumnCellProps}>
          Commercial license
        </Div>
        <Div {...firstColumnCellProps}>
          Invoices
        </Div>
      </Div>
      <Div {...columnStyles}>
        <Div subtitle2>
          Free
        </Div>
        <Div body2>
          Free
        </Div>
        <Div body2>
          Unlimited
        </Div>
        <Div body2>
          Unlimited
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div body2>
          Best effort
        </Div>
        <Div body2>
          Google SSO + OIDC
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
      </Div>
      <Div {...columnStyles}>
        <Div subtitle2>
          Professional
        </Div>
        <Div body2>
          $399/cluster/month
        </Div>
        <Div body2>
          Unlimited
        </Div>
        <Div body2>
          $49/user/month
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          24 hours
        </Div>
        <Div body2>
          Best effort
        </Div>
        <Div body2>
          Google SSO + OIDC
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CheckIcon color="icon-success" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          Available
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
        <Div>
          <CloseIcon color="icon-default" />
        </Div>
      </Div>
      <Div {...columnStyles}>
        <Div subtitle2>
          Enterprise
        </Div>
      </Div>
    </Div>
  )
}

export default BillingPricingTable

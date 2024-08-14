import { CheckIcon, CloseIcon } from '@pluralsh/design-system'
import { Div } from 'honorable'

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

const lastColumnCellProps = {
  borderRight: '1px solid border-fill-two',
}

function BillingPricingTable() {
  return (
    <Div
      display="grid"
      gridTemplateColumns="repeat(3, 1fr)"
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
          Open-Source Apps
        </Div>
        <Div {...firstColumnCellProps}>Clusters</Div>
        <Div {...firstColumnCellProps}>Users</Div>
        <Div {...firstColumnCellProps}>Services</Div>
        <Div {...firstColumnCellProps}>Roles</Div>
        <Div {...firstColumnCellProps}>Groups</Div>
        <Div {...firstColumnCellProps}>Service accounts</Div>
        <Div {...firstColumnCellProps}>Continuous deployment</Div>
        <Div {...firstColumnCellProps}>Discord Forum</Div>
        <Div {...firstColumnCellProps}>Community support</Div>
        <Div {...firstColumnCellProps}>
          Private Slack Connect to Plural engineers
        </Div>
        <Div {...firstColumnCellProps}>Dedicated support engineer</Div>
        <Div {...firstColumnCellProps}>Onboarding</Div>
        <Div {...firstColumnCellProps}>Emergency Hotfixes</Div>
        <Div {...firstColumnCellProps}>SLAs</Div>
        <Div {...firstColumnCellProps}>Coverage</Div>
        <Div {...firstColumnCellProps}>Authentication</Div>
        <Div {...firstColumnCellProps}>VPN</Div>
        <Div {...firstColumnCellProps}>Audit logs</Div>
        <Div {...firstColumnCellProps}>SOC 2</Div>
        <Div {...firstColumnCellProps}>GDPR</Div>
        <Div {...firstColumnCellProps}>Compliance reports</Div>
        <Div {...firstColumnCellProps}>Training</Div>
        <Div {...firstColumnCellProps}>Developer support</Div>
        <Div {...firstColumnCellProps}>Commercial license</Div>
        <Div {...firstColumnCellProps}>Cost optimization</Div>
        <Div
          {...firstColumnCellProps}
          borderBottomLeftRadius={6}
          borderBottom="1px solid border-fill-two"
        >
          Invoices
        </Div>
      </Div>
      <Div {...columnStyles}>
        <Div
          subtitle2
          borderTopLeftRadius={6}
          borderLeft="1px solid border-fill-two"
        >
          Open-source
        </Div>
        <Div body2>Unlimited</Div>
        <Div body2>Free</Div>
        <Div body2>Up to 2</Div>
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
        <Div body2>Best effort</Div>
        <Div body2>Google OAuth + OIDC</Div>
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
        <Div borderBottom="1px solid border-fill-two">
          <CloseIcon color="icon-default" />
        </Div>
      </Div>
      <Div {...columnStyles}>
        <Div
          {...lastColumnCellProps}
          subtitle2
          borderTopRightRadius={6}
        >
          Custom
        </Div>
        <Div
          {...lastColumnCellProps}
          body2
        >
          Unlimited
        </Div>
        <Div
          {...lastColumnCellProps}
          body2
        >
          Custom
        </Div>
        <Div
          {...lastColumnCellProps}
          body2
        >
          Unlimited
        </Div>
        <Div
          {...lastColumnCellProps}
          body2
        >
          Unlimited
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>4 hours</Div>
        <Div
          {...lastColumnCellProps}
          body2
        >
          Extended
        </Div>
        <Div
          {...lastColumnCellProps}
          body2
        >
          SSO + Google OAuth + OIDC
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>Available</Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div {...lastColumnCellProps}>
          <CheckIcon color="icon-success" />
        </Div>
        <Div
          borderBottom="1px solid border-fill-two"
          borderBottomRightRadius={6}
        >
          <CheckIcon color="icon-success" />
        </Div>
      </Div>
    </Div>
  )
}

export default BillingPricingTable

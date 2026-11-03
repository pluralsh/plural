import { Button, Card, MoreIcon, SearchIcon } from '@pluralsh/design-system'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Body1BoldP, Body2P } from '../utils/Typography'

export type UpgradeGateSampleRow = {
  name: string
  caption: string
  meta?: string
}

export const SAMPLE_GROUP_ROWS: UpgradeGateSampleRow[] = [
  {
    name: 'Admin',
    caption: 'Full permissions for administrative users.',
    meta: '2 users',
  },
  {
    name: 'General',
    caption: 'Default group for all users in this account.',
    meta: '34 users',
  },
  { name: 'Developers', caption: 'All developers.', meta: '7 users' },
  { name: 'Support', caption: 'Support team permissions.', meta: '11 users' },
]

export function UpgradeGate({
  feature,
  description,
  searchPlaceholder,
  rows,
  rowIcon,
  rowAction,
}: {
  feature: string
  description: string
  searchPlaceholder: string
  rows: UpgradeGateSampleRow[]
  rowIcon?: ReactNode
  rowAction?: string
}) {
  return (
    <GateSC>
      <SampleListSC
        aria-hidden
        inert
      >
        <div className="search">
          <SearchIcon />
          {searchPlaceholder}
        </div>
        {rows.map(({ name, caption, meta }) => (
          <div
            key={name}
            className="row"
          >
            {rowIcon && <div className="icon">{rowIcon}</div>}
            <div className="copy">
              <span className="name">{name}</span>
              <span className="caption">{caption}</span>
            </div>
            {meta && <span className="caption">{meta}</span>}
            {rowAction && (
              <Button
                small
                secondary
                disabled
              >
                {rowAction}
              </Button>
            )}
            <MoreIcon />
          </div>
        ))}
      </SampleListSC>
      <GateCardSC fillLevel={2}>
        <Body1BoldP>Upgrade your plan to access {feature}.</Body1BoldP>
        <Body2P $color="text-light">{description}</Body2P>
        <div className="actions">
          <Button
            as={Link}
            to="/account/billing"
          >
            Review plans
          </Button>
        </div>
      </GateCardSC>
    </GateSC>
  )
}

const GateSC = styled.div({
  position: 'relative',
})

const SampleListSC = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  border: theme.borders.default,
  borderRadius: theme.borderRadiuses.large,
  backgroundColor: theme.colors['fill-one'],
  color: theme.colors['text-xlight'],
  filter: 'blur(1.5px)',
  opacity: 0.7,
  maskImage: 'linear-gradient(180deg, black 45%, transparent 100%)',
  pointerEvents: 'none',
  userSelect: 'none',
  '.search': {
    ...theme.partials.text.body2,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.small,
    padding: `${theme.spacing.small} ${theme.spacing.medium}`,
    borderBottom: theme.borders.default,
  },
  '.row': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.medium,
    padding: `${theme.spacing.small} ${theme.spacing.medium}`,
    minHeight: 64,
    '& + .row': { borderTop: theme.borders.default },
  },
  '.icon': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: theme.borderRadiuses.medium,
    border: theme.borders['fill-two'],
    backgroundColor: theme.colors['fill-two'],
  },
  '.copy': {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0,
  },
  '.name': {
    ...theme.partials.text.body1Bold,
    color: theme.colors['text-light'],
  },
  '.caption': {
    ...theme.partials.text.caption,
  },
}))

const GateCardSC = styled(Card)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing.medium,
  left: theme.spacing.medium,
  right: theme.spacing.medium,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.small,
  padding: theme.spacing.large,
  boxShadow: theme.boxShadows.moderate,
  '.actions': {
    marginTop: theme.spacing.small,
  },
}))

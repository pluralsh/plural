import './plan.css'

import { useCallback, useContext, useState } from 'react'
import styled from 'styled-components'
import { Check as Checkmark, Edit, Group, HoveredBackground, Reload as Refresh } from 'forge-core'
import { Anchor, Box, Collapsible, Layer, Stack, Text } from 'grommet'
import { Cube } from 'grommet-icons'
import { normalizeColor } from 'grommet/utils'

import { CurrentUserContext } from '../login/CurrentUser'
import { ignore } from '../utils/ModalHeader'
import { ModalHeader } from '../ModalHeader'

import { PlanType } from './types'
import { ServiceLevel } from './CreatePlan'
import { UpdatePlanForm } from './UpdatePlanForm'

export function LineItemIcon({ dimension, size }) {
  switch (dimension) {
    case 'user':
      return (
        <Group
          size={size || '15px'}
          color="focus"
        />
      )
    default:
      return (
        <Cube
          size={size || '15px'}
          color="focus"
        />
      )
  }
}

export function LineItem({ item: { cost, name, dimension, type }, included: { quantity } }) {
  const metered = type === PlanType.METERED

  return (
    <Box
      direction="row"
      align="center"
      gap="xsmall"
    >
      <LineItemIcon dimension={dimension} />
      <Text
        size="small"
        weight="bold"
      >{name}
      </Text>
      <Text size="small">${cost / 100} / {dimension}</Text>
      {!metered && (
        <Text
          size="small"
          color="dark-3"
        >({quantity} included)
        </Text>
      )}
      {metered && (
        <Refresh
          size="small"
          color="dark-3"
        />
      )}
      {metered && (
        <Text
          size="small"
          color="dark-3"
        >metered
        </Text>
      )}
    </Box>
  )
}

function Feature({ name, description }) {
  return (
    <Box
      direction="row"
      gap="small"
      align="center"
    >
      <Checkmark
        size="15px"
        color="focus"
      />
      <Box>
        <Text
          size="small"
          weight={500}
        >{name}
        </Text>
        <Text size="small"><i>{description}</i></Text>
      </Box>
    </Box>
  )
}

function SubscribedBadge() {
  return (
    <Box
      flex={false}
      width="25px"
      height="25px"
      background="brand"
      align="center"
      justify="center"
    >
      <Checkmark size="12px" />
    </Box>
  )
}

function FeatureSection({ title, children }) {
  return (
    <Box gap="xsmall">
      <Text
        size="small"
        weight={500}
      >{title}
      </Text>
      {children}
    </Box>
  )
}

function Features({ features, serviceLevels, open }) {
  const hasServiceLevels = serviceLevels && serviceLevels.length > 0
  const hasFeatures = features.length > 0

  return (
    <Collapsible open={open}>
      <Box gap="small">
        {hasServiceLevels && (
          <FeatureSection title="SLAs:">
            {(serviceLevels || []).map(level => <ServiceLevel level={level} />)}
          </FeatureSection>
        )}
        {hasFeatures && (
          <FeatureSection title="Features Included:">
            {features.map(feature => (
              <Feature
                key={feature.name}
                {...feature}
              />
            ))}
          </FeatureSection>
        )}
      </Box>
    </Collapsible>
  )
}

export const hover = styled.div`
  &:hover {
    border-color: ${({ theme }) => normalizeColor('brand', theme)}
  }
`

function EditPlan({ plan }) {
  const [open, setOpen] = useState(false)
  const doSetOpen = useCallback((val, e) => {
    ignore(e); setOpen(val)
  }, [setOpen])

  return (
    <>
      <HoveredBackground>
        <Box
          accentable
          className="edit"
          round="xsmall"
          onClick={e => doSetOpen(true, e)}
        >
          <Edit size="small" />
        </Box>
      </HoveredBackground>
      {open && (
        <Layer
          modal
          onClickOutside={e => doSetOpen(false, e)}
        >
          <Box width="50vw">
            <ModalHeader
              text="Update Plan"
              setOpen={doSetOpen}
            />
            <Box pad="small">
              <UpdatePlanForm plan={plan} />
            </Box>
          </Box>
        </Layer>
      )}
    </>
  )
}

export default function Plan({ approvePlan, subscription, repository, plan }) {
  const me = useContext(CurrentUserContext)
  const { name, cost, period, lineItems: { items, included }, metadata } = plan
  const [open, setOpen] = useState(false)
  const hasFeatures = metadata && metadata.features && metadata.features.length > 0
  const hasLevels = plan.serviceLevels && plan.serviceLevels.length > 0
  const hasMore = hasFeatures || hasLevels

  const includedByDimension = included.reduce((byDim, val) => {
    byDim[val.dimension] = val

    return byDim
  }, {})

  const subscribed = subscription && subscription.plan.id === plan.id

  return (
    <Stack
      width="70%"
      anchor="top-right"
    >
      <Box
        className="plan"
        as={hover}
        pad="small"
        focusIndicator={false}
        border={{ color: subscribed ? 'brand' : 'border' }}
        onClick={subscribed ? null : () => approvePlan(plan)}
        gap="small"
      >
        <Box
          direction="row"
          align="center"
        >
          <Box
            gap="xsmall"
            fill="horizontal"
            direction="row"
          >
            <Text
              size="small"
              weight="bold"
            >{name}
            </Text>
            <Text size="small">${cost / 100} {period}</Text>
            {me.id === repository.publisher.owner.id && (
              <EditPlan plan={plan} />
            )}
          </Box>
        </Box>
        <Box gap="xsmall">
          {items.map(item => (
            <LineItem
              key={item.dimension}
              item={item}
              included={includedByDimension[item.dimension]}
            />
          ))}
        </Box>
        {hasMore && (
          <Features
            features={metadata.features}
            serviceLevels={plan.serviceLevels}
            open={open}
          />
        )}
        {hasMore && (
          <Box
            direction="row"
            justify="end"
            gap="xsmall"
            align="center"
          >
            <Anchor
              size="small"
              color="brand"
              onClick={e => {
                e.preventDefault(); e.stopPropagation(); setOpen(!open)
              }}
            >
              {open ? 'Hide' : 'Show'} details
            </Anchor>
          </Box>
        )}
      </Box>
      {subscribed && <SubscribedBadge />}
    </Stack>
  )
}

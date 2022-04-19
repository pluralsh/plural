import { Box, Text } from 'grommet'
import { Checkmark, Cube, Group } from 'grommet-icons'

import { RepoIcon } from '../repos/Repositories'

import { SeverityNub } from './Severity'

function NoPlan() {
  return (
    <Box pad="small">
      <Text size="small">You're currently not on any plan for this repo</Text>
    </Box>
  )
}

function Feature({ feature: { name, description } }) {
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
      <Box gap="xsmall">
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

export function ServiceLevel({ level: { minSeverity, maxSeverity, responseTime } }) {
  return (
    <Box
      direction="row"
      gap="xsmall"
    >
      <SeverityNub severity={minSeverity} />
      <Text size="small">to</Text>
      <SeverityNub severity={maxSeverity} />
      <Text
        size="small"
        weight={500}
      >response time:
      </Text>
      <Text size="small">{responseTime}</Text>
    </Box>
  )
}

function LineItemIcon({ dimension, size }) {
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

function LineItem({ item: { name, dimension }, included: { quantity }, consumed }) {
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
      <Text size="small">{consumed}</Text>
      <Text
        size="small"
        color="dark-3"
      >({quantity} included)
      </Text>
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

export function Subscription({ incident: { repository, subscription } }) {
  if (!subscription) return <NoPlan />

  const { lineItems: { items } } = subscription
  const { plan: { name, lineItems: { included, ...lineItems }, metadata, serviceLevels } } = subscription
  const includedByDimension = included.reduce((byDim, val) => ({ ...byDim, [val.dimension]: val }), {})
  const consumedByDimension = items.reduce((byDim, { quantity, dimension }) => ({ ...byDim, [dimension]: quantity }), {})
  const features = (metadata && metadata && metadata.features) || []
  const hasFeatures = features.length > 0
  const hasLevels = serviceLevels && serviceLevels.length > 0

  return (
    <Box
      pad="small"
      gap="small"
    >
      <Box
        direction="row"
        gap="xsmall"
        align="center"
      >
        <Box
          flex={false}
          pad="small"
          align="center"
        >
          <RepoIcon repo={repository} />
        </Box>
        <Box>
          <Text
            size="small"
            weight={500}
          >Subscribed to {name}
          </Text>
          <Box gap="xsmall">
            {(lineItems.items || []).map(item => (
              <LineItem
                key={item.dimension}
                item={item}
                consumed={consumedByDimension[item.dimension]}
                included={includedByDimension[item.dimension]}
              />
            ))}
          </Box>
        </Box>
      </Box>
      <Box
        fill
        pad="small"
      >
        {hasFeatures && (
          <FeatureSection title="Features:">
            {features.map(feature => (
              <Feature
                key={feature.name}
                feature={feature}
              />
            ))}
          </FeatureSection>
        )}
        {hasLevels && (
          <FeatureSection title="SLAs:">
            {serviceLevels.map((level, ind) => (
              <ServiceLevel
                key={ind}
                level={level}
              />
            ))}
          </FeatureSection>
        )}
      </Box>
    </Box>
  )
}

import { useState } from 'react'
import { Button, SecondaryButton } from 'forge-core'
import { Box } from 'grommet'

import { useMutation } from '@apollo/client'

import { prune } from '../../utils/graphql'

import { SlaForm } from './CreatePlan'
import { UPDATE_PLAN_ATTRS } from './queries'

export function UpdatePlanForm({ plan: { id, serviceLevels } }) {
  const [attributes, setAttributes] = useState({ serviceLevels: serviceLevels.map(prune) })
  const [mutation, { loading }] = useMutation(UPDATE_PLAN_ATTRS, { variables: { id, attributes } })
  const [serviceLevel, setServiceLevel] = useState({ minSeverity: 0, maxSeverity: 3, responseTime: 30 })

  return (
    <Box fill>
      <SlaForm
        attributes={attributes}
        setAttributes={setAttributes}
        serviceLevel={serviceLevel}
        setServiceLevel={setServiceLevel}
      />
      <Box
        direction="row"
        justify="end"
        gap="small"
        margin={{ top: 'small' }}
      >
        <SecondaryButton
          label="Add service level"
          round="xsmall"
          onClick={() => setAttributes({ ...attributes, serviceLevels: [...attributes.serviceLevels, serviceLevel] })}
        />
        <Button
          loading={loading}
          label="Update"
          round="xsmall"
          onClick={mutation}
        />
      </Box>
    </Box>
  )
}

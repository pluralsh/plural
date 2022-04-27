import { Box, Layer, Text } from 'grommet'
import { useMutation } from '@apollo/client'
import { Button } from 'forge-core'

import { ModalHeader } from '../ModalHeader'

import { REPO_Q } from '../repos/queries'

import { UPDATE_PLAN } from './queries'

export default function UpdatePlan({ plan, repository: { id, installation: { subscription } }, setOpen }) {
  const [mutation, { loading }] = useMutation(UPDATE_PLAN, {
    variables: { subscriptionId: subscription.id, planId: plan.id },
    refetchQueries: [{ query: REPO_Q, variables: { repositoryId: id } }],
  })

  return (
    <Layer
      modal
      position="center"
      onEsc={() => setOpen(false)}
    >
      <Box width="40vw">
        <ModalHeader
          text={`Switch to the ${plan.name} plan?`}
          setOpen={setOpen}
        />
        <Box
          pad="medium"
          gap="small"
        >
          <Text size="small"><i>We will migrate all existing line items to match the new plan for you</i></Text>
          <Box
            direction="row"
            align="center"
            justify="end"
          >
            <Button
              loading={loading}
              label="Update"
              onClick={mutation}
            />
          </Box>
        </Box>
      </Box>
    </Layer>
  )
}

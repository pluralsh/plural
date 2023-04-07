import { ArrowLeftIcon, Button, Modal } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { useState } from 'react'

import { Cluster } from '../../generated/graphql'

import { ClusterPicker } from './ClusterPicker'

export function PromoteClusterModal({ open, setOpen }) {
  const [fromCluster, setFromCluster] = useState<Cluster | undefined>(undefined)
  const [toCluster, setToCluster] = useState<Cluster | undefined>(undefined)

  return (
    <Modal
      portal
      open={open}
      onClose={() => setOpen(false)}
      actions={(
        <>
          <Button
            secondary
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!fromCluster || !toCluster}
            // onClick={() => mutation()}
            // loading={loading}
            marginLeft="medium"
          >
            Save
          </Button>
        </>
      )}
      size="large"
    >
      <Flex
        direction="column"
        gap="xlarge"
      >
        <Div subtitle2>Setup cluster promotion</Div>
        {/* {error && (
          <GqlError
            header="Something went wrong"
            error={error}
          />
        )} */}
        <ClusterPicker
          cluster={fromCluster}
          setCluster={setFromCluster}
          heading="Promote app versions from"
        />
        <ArrowLeftIcon transform="rotate(270deg)" />
        <ClusterPicker
          cluster={toCluster}
          setCluster={setToCluster}
          heading="Promote app versions to"
          disabled={!fromCluster}
        />
      </Flex>
    </Modal>
  )
}

import { ArrowLeftIcon, Button, Modal } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { useCallback, useState } from 'react'

import { Cluster } from '../../generated/graphql'

import { ClusterPicker } from './ClusterPicker'

// TODO: Implement logic. Use createClusterDependency before promote.
export function PromoteClusterModal({ open, setOpen }) {
  const [fromCluster, setFromCluster] = useState<Cluster | undefined>()
  const [toCluster, setToCluster] = useState<Cluster | undefined>()
  const close = useCallback(() => {
    setOpen(false)
    setToCluster(undefined)
    setFromCluster(undefined)
  }, [setOpen, setFromCluster, setToCluster])

  return (
    <Modal
      portal
      open={open}
      onClose={close}
      actions={(
        <>
          <Button
            secondary
            onClick={close}
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
          filter={({ id, provider }: Cluster) => id !== fromCluster?.id && provider === fromCluster?.provider}
          heading="Promote app versions to"
          disabled={!fromCluster}
        />
      </Flex>
    </Modal>
  )
}

import { ArrowLeftIcon, Button, Modal } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { Dispatch, useCallback, useState } from 'react'
import { useMutation } from '@apollo/client'

import { Cluster } from '../../generated/graphql'
import { ClusterPicker } from '../utils/ClusterPicker'
import { GqlError } from '../utils/Alert'

import { CLUSTERS, CREATE_CLUSTER_DEPENDENCY } from '../overview/queries'

type ClusterDependencyModalProps = {
  open: boolean
  setOpen: Dispatch<boolean>
  destinationCluster: Cluster
}

export function ClusterDependencyModal({ open, setOpen, destinationCluster }: ClusterDependencyModalProps) {
  const [sourceCluster, setSourceCluster] = useState<Cluster | undefined>()

  const close = useCallback(() => {
    setOpen(false)
    setSourceCluster(undefined)
  }, [setOpen, setSourceCluster])

  const [mutation, { loading, error }] = useMutation(CREATE_CLUSTER_DEPENDENCY, {
    variables: { source: sourceCluster?.id || '', dest: destinationCluster.id || '' },
    refetchQueries: [{ query: CLUSTERS }],
    onCompleted: () => close(),
  })

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
            disabled={!sourceCluster}
            onClick={mutation}
            loading={loading}
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
        <Div subtitle2>Set-up cluster promotion</Div>
        {error && (
          <GqlError
            header="Something went wrong"
            error={error}
          />
        )}
        <ClusterPicker
          cluster={sourceCluster}
          setCluster={setSourceCluster}
          filter={({ id, provider }: Cluster) => id !== destinationCluster?.id && provider === destinationCluster?.provider}
          heading="Promotion source"
          showUpgradeInfo
        />
        <ArrowLeftIcon transform="rotate(270deg)" />
        <ClusterPicker
          cluster={destinationCluster}
          setCluster={() => null}
          heading="Promotion destination"
          showUpgradeInfo
          disabled
        />
      </Flex>
    </Modal>
  )
}

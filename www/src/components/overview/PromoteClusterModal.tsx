import { ArrowLeftIcon, Button, Modal } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { useCallback, useContext, useState } from 'react'
import { useMutation } from '@apollo/client'

import { Cluster } from '../../generated/graphql'
import { ClusterPicker } from '../utils/ClusterPicker'
import { GqlError } from '../utils/Alert'

import ClustersContext from '../../contexts/ClustersContext'

import { CREATE_CLUSTER_DEPENDENCY, PROMOTE } from './queries'

export function PromoteClusterModal({ open, setOpen }) {
  const { refetch } = useContext(ClustersContext)
  const [fromCluster, setFromCluster] = useState<Cluster | undefined>()
  const [toCluster, setToCluster] = useState<Cluster | undefined>()
  const close = useCallback(() => {
    setOpen(false)
    setToCluster(undefined)
    setFromCluster(undefined)
  }, [setOpen, setFromCluster, setToCluster])

  const [createClusterDependency, { loading: creating, error: errorCreate }] = useMutation(CREATE_CLUSTER_DEPENDENCY, {
    variables: { source: fromCluster?.id || '', dest: toCluster?.id || '' },
    onCompleted: () => {
      refetch?.()
      promote() // TODO: Test.
    },
  })

  const [promote, { loading: promoting, error: errorPromote }] = useMutation(PROMOTE)

  const save = useCallback(() => {
    const dependency = toCluster?.dependency
    const canPromote = dependency?.dependency?.id === fromCluster?.id
      && dependency?.cluster?.id === toCluster?.id

    if (canPromote) {
      promote() // TODO: Test. Impersonate?

      return
    }

    console.log(dependency) // TODO: Remove.

    createClusterDependency()
  }, [fromCluster, toCluster, createClusterDependency, promote])

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
            onClick={() => save()}
            loading={creating || promoting}
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
        {errorCreate || errorPromote && (
          <GqlError
            header="Something went wrong"
            error={errorCreate || errorPromote}
          />
        )}
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

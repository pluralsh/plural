import { ArrowLeftIcon, Button, Modal } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { Dispatch, useCallback, useContext, useState } from 'react'
import { useMutation } from '@apollo/client'

import subscriptionContext from '../../contexts/SubscriptionContext'

import { Cluster } from '../../generated/graphql'
import { ClusterPicker } from '../utils/ClusterPicker'
import { GqlError } from '../utils/Alert'

import { CLUSTERS, CREATE_CLUSTER_DEPENDENCY } from '../overview/queries'

import UpgradeNeededModal from './UpgradeNeededModal'

type ClusterDependencyModalProps = {
  open: boolean
  setOpen: Dispatch<boolean>
  destination: Cluster
}

export function ClusterDependencyModal({
  open,
  setOpen,
  destination,
}: ClusterDependencyModalProps) {
  const { isPaidPlan, isTrialPlan } = useContext(subscriptionContext)
  const [source, setSource] = useState<Cluster | undefined>()

  const close = useCallback(() => {
    setOpen(false)
    setSource(undefined)
  }, [setOpen, setSource])

  const [mutation, { loading, error }] = useMutation(
    CREATE_CLUSTER_DEPENDENCY,
    {
      variables: { source: source?.id || '', dest: destination.id || '' },
      refetchQueries: [{ query: CLUSTERS }],
      onCompleted: () => close(),
    }
  )

  const filterSources = useCallback(
    (s: Cluster) => {
      const d = destination

      return (
        s.dependency?.dependency?.id !== d.id && // Avoid circular dependencies between clusters.
        s.id !== d?.id && // Source cluster has to be different than destination cluster.
        s.provider === d?.provider
      ) // Clusters must use the same provider.
    },
    [destination]
  )

  if (!(isPaidPlan || isTrialPlan))
    return (
      <UpgradeNeededModal
        open={open}
        onClose={close}
      />
    )

  return (
    <Modal
      open={open}
      onClose={close}
      actions={
        <>
          <Button
            secondary
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            disabled={!source}
            onClick={mutation}
            loading={loading}
            marginLeft="medium"
          >
            Save
          </Button>
        </>
      }
      size="large"
    >
      <Flex
        direction="column"
        gap="xlarge"
        overflow="hidden"
      >
        <Div subtitle2>Set up promotions</Div>
        {error && (
          <GqlError
            header="Something went wrong"
            error={error}
          />
        )}
        <ClusterPicker
          cluster={source}
          setCluster={setSource}
          filter={filterSources}
          heading="Promotion source"
          showHealthStatus
        />
        <ArrowLeftIcon transform="rotate(270deg)" />
        <ClusterPicker
          cluster={destination}
          heading="Promotion destination"
          showHealthStatus
          disabled
        />
      </Flex>
    </Modal>
  )
}

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
  destination: Cluster
}

export function ClusterDependencyModal({ open, setOpen, destination }: ClusterDependencyModalProps) {
  const [source, setSource] = useState<Cluster | undefined>()

  const close = useCallback(() => {
    setOpen(false)
    setSource(undefined)
  }, [setOpen, setSource])

  const [mutation, { loading, error }] = useMutation(CREATE_CLUSTER_DEPENDENCY, {
    variables: { source: source?.id || '', dest: destination.id || '' },
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
            disabled={!source}
            onClick={mutation}
            loading={loading}
            marginLeft="medium"
          >
            Save
          </Button>
        </>
      )}
      size="large"
      overflow="hidden"
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
          cluster={source}
          setCluster={setSource}
          filter={({ id, provider }: Cluster) => id !== destination?.id && provider === destination?.provider}
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

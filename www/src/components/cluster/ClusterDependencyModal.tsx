import { ArrowLeftIcon, Button, Modal } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { useCallback, useMemo, useState } from 'react'
import { useMutation } from '@apollo/client'
import isNil from 'lodash/isNil'

import { Cluster } from '../../generated/graphql'
import { ClusterPicker } from '../utils/ClusterPicker'
import { GqlError } from '../utils/Alert'
import useImpersonatedServiceAccount from '../../hooks/useImpersonatedServiceAccount'
import { ensureURLValidity } from '../../utils/url'

import { CLUSTERS, CREATE_CLUSTER_DEPENDENCY, PROMOTE } from '../overview/queries'
import { ClusterUpgradeInfo } from '../overview/ClusterUpgradeInfo'

export function ClusterDependencyModal({ open, setOpen }) {
  const [fromCluster, setFromCluster] = useState<Cluster | undefined>()
  const [toCluster, setToCluster] = useState<Cluster | undefined>()
  const [promoting, setPromoting] = useState(false)
  const [promoteError, setPromoteError] = useState()
  const [finished, setFinished] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
    setFinished(false)
    setPromoteError(undefined)
    setToCluster(undefined)
    setFromCluster(undefined)
  }, [setOpen, setFromCluster, setToCluster])

  const { client } = useImpersonatedServiceAccount(toCluster?.owner?.id, !toCluster?.owner?.serviceAccount)

  const [createClusterDependency, { loading: creating, error: createError }] = useMutation(CREATE_CLUSTER_DEPENDENCY, {
    variables: { source: fromCluster?.id || '', dest: toCluster?.id || '' },
    refetchQueries: [{ query: CLUSTERS }],
    onCompleted: () => promote(),
  })

  const canPromote = useMemo(() => {
    if (!fromCluster || !toCluster || !client) return false
    const { dependency } = toCluster

    return dependency?.dependency?.id === fromCluster?.id && dependency?.cluster?.id === toCluster?.id
  }, [fromCluster, toCluster, client])

  const promote = useCallback(() => {
    setPromoting(true)
    client?.mutate({ mutation: PROMOTE })
      .then(() => {
        setPromoting(false)
        setFinished(true)
      })
      .catch(error => {
        setPromoting(false)
        setPromoteError(error)
      })
  }, [client])

  const save = useCallback(() => (canPromote ? promote() : createClusterDependency()),
    [canPromote, promote, createClusterDependency])

  const hint = useCallback((pending: number | undefined) => (!isNil(pending)
    ? `${pending} application${pending !== 1 ? 's' : ''} pending`
    : undefined), [])

  return (
    <Modal
      portal
      open={open}
      onClose={close}
      actions={finished ? (toCluster?.consoleUrl && (
        <Button
          onClick={close}
          as="a"
          href={ensureURLValidity(toCluster?.consoleUrl)}
          target="_blank"
          rel="noopener noreferrer"
        >
          View in console
        </Button>
      )) : (
        <>
          <Button
            secondary
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            disabled={!fromCluster || !toCluster || !client}
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
        <Div subtitle2>{finished ? 'Cluster promotion complete' : 'Setup cluster promotion'}</Div>
        {createError || promoteError && (
          <GqlError
            header="Something went wrong"
            error={createError || promoteError}
          />
        )}
        {!finished && (
          <>
            <ClusterPicker
              cluster={fromCluster}
              setCluster={setFromCluster}
              heading="Promote app versions from"
              hint={hint(fromCluster?.upgradeInfo?.length)}
              showUpgradeInfo
            />
            <ClusterUpgradeInfo
              clusterId={fromCluster?.id}
              upgradeInfo={fromCluster?.upgradeInfo}
            />
            <ArrowLeftIcon transform="rotate(270deg)" />
            <ClusterPicker
              cluster={toCluster}
              setCluster={setToCluster}
              filter={({ id, provider }: Cluster) => id !== fromCluster?.id && provider === fromCluster?.provider}
              heading="Promote app versions to"
              showUpgradeInfo
              hint={hint(toCluster?.upgradeInfo?.length)}
              disabled={!fromCluster}
            />
            <ClusterUpgradeInfo
              clusterId={toCluster?.id}
              upgradeInfo={toCluster?.upgradeInfo}
            />
          </>
        )}
      </Flex>
    </Modal>
  )
}

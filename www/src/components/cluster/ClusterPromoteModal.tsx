import { ArrowLeftIcon, Button, Modal } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { Dispatch, useCallback, useContext, useState } from 'react'
import isNil from 'lodash/isNil'
import { useMutation } from '@apollo/client'

import { Cluster } from '../../generated/graphql'
import { ClusterPicker } from '../utils/ClusterPicker'
import { GqlError } from '../utils/Alert'
import { ensureURLValidity } from '../../utils/url'

import { DELETE_CLUSTER_DEPENDENCY, PROMOTE } from '../overview/queries'
import { ClusterUpgradeInfo } from '../overview/ClusterUpgradeInfo'
import ImpersonateServiceAccount from '../utils/ImpersonateServiceAccount'
import { Confirm } from '../utils/Confirm'
import ClustersContext from '../../contexts/ClustersContext'

type ClusterPromoteModalProps = {
  open: boolean
  setOpen: Dispatch<boolean>
  destination: Cluster
}

export function ClusterPromoteModal({
  open,
  setOpen,
  destination,
}: ClusterPromoteModalProps) {
  return (
    <ImpersonateServiceAccount
      id={destination.owner?.id}
      skip={!destination.owner?.serviceAccount}
    >
      <ClusterPromoteModalInternal
        open={open}
        setOpen={setOpen}
        destination={destination}
      />
    </ImpersonateServiceAccount>
  )
}

function ClusterPromoteModalInternal({
  open,
  setOpen,
  destination,
}: ClusterPromoteModalProps) {
  const [finished, setFinished] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const { refetchClusters } = useContext(ClustersContext)

  const [mutation, { loading, error, reset }] = useMutation(PROMOTE, {
    onCompleted: () => {
      setFinished(true)
      refetchClusters?.()
    },
  })

  const [
    deactivateMutation,
    {
      loading: deactivateLoading,
      error: deactivateError,
      reset: deactivateReset,
    },
  ] = useMutation(DELETE_CLUSTER_DEPENDENCY, {
    variables: {
      source: destination.dependency?.dependency?.id || '',
      dest: destination.id || '',
    },
    onCompleted: () => {
      setDeactivating(false)
      refetchClusters?.()
    },
  })

  const close = useCallback(() => {
    setOpen(false)
    setFinished(false)
    reset()
  }, [setOpen, setFinished, reset])

  const hint = useCallback(
    (pending: number | undefined) =>
      !isNil(pending)
        ? `${pending === 0 ? 'no' : pending} application${
            pending !== 1 ? 's' : ''
          } pending`
        : undefined,
    []
  )

  return (
    <>
      <Modal
        open={open}
        onClose={close}
        actions={
          <>
            <Button
              secondary
              onClick={close}
              marginRight="medium"
            >
              Cancel
            </Button>
            {finished ? (
              destination.consoleUrl && (
                <Button
                  onClick={close}
                  as="a"
                  href={ensureURLValidity(destination.consoleUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View in console
                </Button>
              )
            ) : (
              <Button
                disabled={!destination.dependency}
                onClick={mutation}
                loading={loading}
              >
                Promote
              </Button>
            )}
          </>
        }
        size="large"
        overflow="hidden"
      >
        <Flex
          direction="column"
          gap="xlarge"
        >
          <Div subtitle2>
            {finished ? 'Cluster promotion complete' : 'Cluster promotion'}
          </Div>
          {error && (
            <GqlError
              header="Something went wrong"
              error={error}
            />
          )}
          {!finished && (
            <>
              <ClusterPicker
                cluster={destination.dependency?.dependency}
                heading="Promotion source"
                disabled
              />
              <ArrowLeftIcon transform="rotate(270deg)" />
              <ClusterPicker
                cluster={destination}
                heading="Promotion destination"
                showUpgradeInfo
                hint={hint(destination.upgradeInfo?.length)}
                disabled
              />
              <ClusterUpgradeInfo
                clusterId={destination.id}
                upgradeInfo={destination.upgradeInfo}
              />
              <Div
                caption
                color="text-danger-light"
                cursor="pointer"
                marginTop="minus-large"
                textDecoration="underline"
                _hover={{ color: 'red.100' }}
                onClick={() => {
                  close()
                  setDeactivating(true)
                }}
              >
                Disable promotions
              </Div>
            </>
          )}
        </Flex>
      </Modal>
      <Confirm
        open={deactivating}
        close={() => {
          deactivateReset()
          setDeactivating(false)
        }}
        error={deactivateError}
        title="Confirm disabling promotions"
        text="Are you sure you want to complete this action?"
        label="Continue"
        submit={deactivateMutation}
        loading={deactivateLoading}
      />
    </>
  )
}

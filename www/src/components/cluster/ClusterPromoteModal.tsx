import { ArrowLeftIcon, Button, Modal } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { Dispatch, useCallback, useState } from 'react'
import isNil from 'lodash/isNil'

import { Cluster } from '../../generated/graphql'
import { ClusterPicker } from '../utils/ClusterPicker'
import { GqlError } from '../utils/Alert'
import useImpersonatedServiceAccount from '../../hooks/useImpersonatedServiceAccount'
import { ensureURLValidity } from '../../utils/url'

import { PROMOTE } from '../overview/queries'
import { ClusterUpgradeInfo } from '../overview/ClusterUpgradeInfo'

type ClusterPromoteModalProps = {
  open: boolean
  setOpen: Dispatch<boolean>
  destination: Cluster
}

export function ClusterPromoteModal({ open, setOpen, destination }: ClusterPromoteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [finished, setFinished] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
    setFinished(false)
    setError(undefined)
  }, [setOpen, setFinished, setError])

  const {
    client,
    error: impersonationError,
  } = useImpersonatedServiceAccount(destination.owner?.id, !destination.owner?.serviceAccount)

  const promote = useCallback(() => {
    setLoading(true)
    client?.mutate({ mutation: PROMOTE })
      .then(() => {
        setLoading(false)
        setFinished(true)
      })
      .catch(error => {
        setLoading(false)
        setError(error)
      })
  }, [client])

  const hint = useCallback((pending: number | undefined) => (!isNil(pending)
    ? `${pending} application${pending !== 1 ? 's' : ''} pending`
    : undefined), [])

  return (
    <Modal
      portal
      open={open}
      onClose={close}
      actions={finished ? (destination.consoleUrl && (
        <Button
          onClick={close}
          as="a"
          href={ensureURLValidity(destination.consoleUrl)}
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
            disabled={!destination.dependency || !client}
            onClick={() => promote()}
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
        <Div subtitle2>Cluster promotion</Div>
        {(error || impersonationError) && (
          <GqlError
            header="Something went wrong"
            error={error || impersonationError}
          />
        )}
        {!finished && (
          <>
            <ClusterPicker
              cluster={destination.dependency.dependency}
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
          </>
        )}
      </Flex>
    </Modal>
  )
}

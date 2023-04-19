import { ArrowLeftIcon, Button, Modal } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'
import { Dispatch, useCallback, useState } from 'react'
import isNil from 'lodash/isNil'
import { useMutation } from '@apollo/client'

import { Cluster } from '../../generated/graphql'
import { ClusterPicker } from '../utils/ClusterPicker'
import { GqlError } from '../utils/Alert'
import { ensureURLValidity } from '../../utils/url'

import { CLUSTERS, PROMOTE } from '../overview/queries'
import { ClusterUpgradeInfo } from '../overview/ClusterUpgradeInfo'
import ImpersonateServiceAccount from '../utils/ImpersonateServiceAccount'

type ClusterPromoteModalProps = {
  open: boolean
  setOpen: Dispatch<boolean>
  destination: Cluster
}

export function ClusterPromoteModal({ open, setOpen, destination }: ClusterPromoteModalProps) {
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

function ClusterPromoteModalInternal({ open, setOpen, destination }: ClusterPromoteModalProps) {
  const [finished, setFinished] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
    setFinished(false)
  }, [setOpen, setFinished])

  const [mutation, { loading, error }] = useMutation(PROMOTE, {
    refetchQueries: [{ query: CLUSTERS }],
    onCompleted: () => setFinished(true),
  })

  const hint = useCallback((pending: number | undefined) => (!isNil(pending)
    ? `${pending === 0 ? 'no' : pending} application${pending !== 1 ? 's' : ''} pending`
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
            disabled={!destination.dependency}
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
        <Div subtitle2>Cluster promotion</Div>
        {error && (
          <GqlError
            header="Something went wrong"
            error={error}
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

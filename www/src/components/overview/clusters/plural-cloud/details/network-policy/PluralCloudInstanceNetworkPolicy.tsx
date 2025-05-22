import {
  Button,
  Card,
  EditIcon,
  Flex,
  Modal,
  NetworkInterfaceIcon,
  PencilIcon,
  Table,
} from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'
import { Body1BoldP, Body2P } from 'components/utils/Typography'
import { ConsoleInstanceFragment } from 'generated/graphql'
import { isEmpty } from 'lodash'
import { useState } from 'react'
import { useTheme } from 'styled-components'
import { isNonNullable } from 'utils/isNonNullable'
import { NetworkPolicyForm } from './NetworkPolicyForm'

type NetworkPolicyTableMeta = { openEditModal?: () => void }
const columnHelper = createColumnHelper<string>()

export function PluralCloudInstanceNetworkPolicy({
  instance,
}: {
  instance: ConsoleInstanceFragment
}) {
  const [showModal, setShowModal] = useState(false)

  const allowedCidrs = instance.network?.allowedCidrs?.filter(isNonNullable)

  const reactTableOptions = {
    meta: { openEditModal: () => setShowModal(true) },
  }

  return (
    <div>
      {isEmpty(allowedCidrs) ? (
        <NetworkPolicyEmptyState onAddCidrRules={() => setShowModal(true)} />
      ) : (
        <Table
          data={allowedCidrs ?? []}
          columns={cols}
          reactTableOptions={reactTableOptions}
        />
      )}
      <Modal
        header={`${isEmpty(allowedCidrs) ? 'Add' : 'Edit'} CIDR rules`}
        open={showModal}
        onClose={() => setShowModal(false)}
      >
        <NetworkPolicyForm
          instanceId={instance.id}
          initialCidrs={allowedCidrs ?? []}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  )
}

const cols = [
  columnHelper.accessor((rule) => rule, {
    id: 'rule',
    header: 'CIDR rule',
    meta: { gridTemplate: '1fr' },
    cell: ({ row: { original: cidr } }) => cidr,
  }),
  columnHelper.display({
    id: 'editRuleHeader',
    header: ({ table }) => {
      const meta = table.options.meta as NetworkPolicyTableMeta
      return (
        <Button
          small
          floating
          startIcon={<EditIcon />}
          onClick={() => meta?.openEditModal?.()}
        >
          Edit rules
        </Button>
      )
    },
  }),
]

function NetworkPolicyEmptyState({
  onAddCidrRules,
}: {
  onAddCidrRules: () => void
}) {
  const { spacing } = useTheme()
  return (
    <Card css={{ padding: `${spacing.xxxlarge}px` }}>
      <Flex
        gap="medium"
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
      >
        <NetworkInterfaceIcon
          color="icon-primary"
          size={36}
        />
        <div>
          <Body1BoldP>You do not have a network policy yet</Body1BoldP>
          <Body2P $color="text-light">
            Click below to add your first CIDR rules.
          </Body2P>
        </div>
        <Button
          marginTop={spacing.xsmall}
          startIcon={<PencilIcon />}
          onClick={onAddCidrRules}
        >
          Create CIDR rules
        </Button>
      </Flex>
    </Card>
  )
}

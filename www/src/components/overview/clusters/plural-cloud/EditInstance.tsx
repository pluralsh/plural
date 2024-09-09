import {
  Button,
  Flex,
  ListBoxItem,
  Modal,
  Select,
} from '@pluralsh/design-system'
import { FormFieldSC } from 'components/create-cluster/steps/ConfigureCloudInstanceStep'
import {
  ConsoleInstanceFragment,
  ConsoleSize,
  useUpdateConsoleInstanceMutation,
} from 'generated/graphql'
import { useState } from 'react'

import { GqlError } from 'components/utils/Alert'

import { useTheme } from 'styled-components'

import { firstLetterUppercase } from './CloudInstanceTableCols'

export function EditInstanceSizeModal({
  open,
  onClose,
  refetch,
  instance,
}: {
  open: boolean
  onClose: () => void
  refetch?: () => void
  instance: ConsoleInstanceFragment
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      header={`${instance.name} cloud instance size`}
    >
      <EditInstanceSize
        onClose={onClose}
        refetch={refetch}
        instance={instance}
      />
    </Modal>
  )
}

function EditInstanceSize({
  onClose,
  refetch,
  instance,
}: {
  onClose: () => void
  refetch?: () => void
  instance: ConsoleInstanceFragment
}) {
  const theme = useTheme()
  const [size, setSize] = useState<ConsoleSize>(instance.size)
  const [mutation, { loading, error }] = useUpdateConsoleInstanceMutation({
    variables: {
      id: instance.id,
      attributes: {
        size,
      },
    },
    onCompleted: () => {
      refetch?.()
      onClose()
    },
  })

  return (
    <Flex
      direction="column"
      gap="medium"
    >
      {error && <GqlError error={error} />}
      <FormFieldSC label="Cluster size">
        <Select
          selectedKey={size}
          onSelectionChange={(size) => setSize(size as ConsoleSize)}
          css={{ background: 'transparent' }}
        >
          {Object.values(ConsoleSize)
            .reverse()
            .map((value) => (
              <ListBoxItem
                key={value}
                label={firstLetterUppercase(value)}
              />
            ))}
        </Select>
      </FormFieldSC>
      <Flex
        gap="medium"
        alignSelf="flex-end"
        marginTop={theme.spacing.medium}
      >
        <Button
          secondary
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          disabled={size === instance.size}
          loading={loading}
          onClick={() => mutation()}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  )
}

import {
  AppIcon,
  Button,
  ConsoleIcon,
  Flex,
  FormField,
  Input,
  ListBoxItem,
  MailIcon,
  Modal,
  PlusIcon,
  Select,
  Table,
} from '@pluralsh/design-system'
import { FormFieldSC } from 'components/create-cluster/steps/ConfigureCloudInstanceStep'
import {
  ConsoleInstanceFragment,
  ConsoleSize,
  OidcProviderFragment,
  useGroupMembersQuery,
  useNotificationsQuery,
  useOidcProvidersQuery,
  useUpdateConsoleInstanceMutation,
} from 'generated/graphql'
import { useMemo, useState } from 'react'

import { GqlError } from 'components/utils/Alert'

import { useTheme } from 'styled-components'

import { firstLetterUppercase } from './CloudInstanceTableCols'
import {
  DEFAULT_REACT_VIRTUAL_OPTIONS,
  useFetchPaginatedData,
} from '../../../utils/useFetchPaginatedData'
import { mapExistingNodes } from '../../../../utils/graphql'
import { createColumnHelper } from '@tanstack/react-table'
import { CellWrap } from '../SelfHostedTableCols'
import { isEmpty } from 'lodash'

export function EditPluralOIDCClientModal({
  open,
  onClose,
  instanceName,
  oidcProvider,
  useModalOverlay = true,
}: {
  open: boolean
  onClose: () => void
  instanceName: string
  oidcProvider?: OidcProviderFragment
  useModalOverlay?: boolean
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      overlayStyles={{ background: useModalOverlay ? undefined : 'none' }}
      header={`${instanceName} - Edit Plural OIDC clients`}
    >
      <EditPluralOIDCClient
        onClose={onClose}
        oidcProvider={oidcProvider}
      />
    </Modal>
  )
}

function EditPluralOIDCClient({
  onClose,
  oidcProvider,
}: {
  onClose: () => void
  oidcProvider?: OidcProviderFragment
}) {
  const theme = useTheme()
  const createMode = isEmpty(oidcProvider)
  const [name, setName] = useState(oidcProvider?.name ?? '')
  const [description, setDescription] = useState(oidcProvider?.name ?? '')

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xlarge,
      }}
    >
      <div>
        <FormField
          label="Name"
          required
        >
          <Input
            autoFocus
            value={name}
            onChange={({ target: { value } }) => setName(value)}
          />
        </FormField>
        <FormField label="Description">
          <Input
            value={description}
            onChange={({ target: { value } }) => setDescription(value)}
          />
        </FormField>
      </div>
      <div css={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          secondary
          onClick={onClose}
        >
          Back to Plural OIDC clients
        </Button>
        <Button
          secondary
          onClick={onClose}
        >
          {createMode ? 'Create' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

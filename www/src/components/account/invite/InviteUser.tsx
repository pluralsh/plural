import {
  Button,
  CaretLeftIcon,
  Codeline,
  FormField,
  Input,
  MailIcon,
} from '@pluralsh/design-system'
import { Switch } from 'honorable'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import {
  BindingAttributes,
  GroupConnection,
  Invite,
  useCreateInviteMutation,
  useGroupsQuery,
} from '../../../generated/graphql'
import { isValidEmail } from '../../../utils/email'
import { extendConnection } from '../../../utils/graphql'
import { GqlError } from '../../utils/Alert'
import GroupBindingsComboBox from '../../utils/combobox/GroupBindingsComboBox'
import { toGroups } from '../../utils/combobox/helpers'
import { GroupBase } from '../../utils/combobox/types'
import { inviteLink } from '../utils'

import { EmailInputProps } from './types'

function EmailInput({
  onValidityChange,
  onChange,
}: EmailInputProps): ReactElement {
  const [value, setValue] = useState('')
  const valid = useMemo(() => isValidEmail(value), [value])
  const hint = useMemo(
    () => (valid || !value ? '' : 'Please provide a valid email'),
    [valid, value]
  )

  useEffect(() => onValidityChange?.(valid), [onValidityChange, valid])

  return (
    <FormField
      label="Email address"
      required
      hint={hint}
      error={!valid}
    >
      <Input
        autoFocus
        placeholder="User email address"
        value={value}
        onChange={({ target: { value } }) => {
          setValue(value)
          onChange?.(value)
        }}
        startIcon={<MailIcon color="icon-light" />}
      />
    </FormField>
  )
}

const InviteUserActions = styled(InviteUserActionsUnstyled)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: theme.spacing.medium,
  padding: `${theme.spacing.xsmall}px 0`,
}))

function InviteUserActionsUnstyled({
  disabled,
  loading,
  onCancel,
  onBack,
  onCreate,
  invited,
  ...props
}): ReactElement {
  return (
    <div {...props}>
      {onBack && (
        <Button
          secondary
          onClick={onBack}
          startIcon={<CaretLeftIcon />}
        >
          Back
        </Button>
      )}
      {!invited && (
        <>
          {onCancel && (
            <Button
              secondary
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            disabled={disabled || loading}
            loading={loading}
            onClick={onCreate}
          >
            Invite
          </Button>
        </>
      )}
      {invited && (
        <>
          <div />
          <Button onClick={onCancel ?? onBack}>Done</Button>
        </>
      )}
    </div>
  )
}

const InvitationMessage = styled(InvitationMessageUnstyled)(({ theme }) => ({
  '.message': {
    ...theme.partials.text.body2,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xsmall,
  },
}))

function InvitationMessageUnstyled({
  invite,
  ...props
}: {
  invite: Invite
}): ReactElement {
  return (
    <div {...props}>
      {invite?.secureId && (
        <div className="message">
          <span>Use this secure link to finish the invitation process.</span>
          <Codeline>{inviteLink(invite)}</Codeline>
        </div>
      )}
      {!invite.secureId && (
        <div className="message">
          An email was sent to {invite.email} to accept the invite.
        </div>
      )}
    </div>
  )
}

const InviteUser = styled(InviteUserUnstyled)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: theme.spacing.medium,

  '.message': {
    ...theme.partials.text.body2,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xsmall,
  },

  '.divider': {
    borderBottom: theme.borders.default,
  },

  '.switch': {
    display: 'flex',
  },
}))

function InviteUserUnstyled({
  onGroupCreate,
  onInvite,
  onCancel,
  onBack,
  bindings,
  refetch,
  serviceAccountId,
  oidcProviderId,
  ...props
}): ReactElement {
  const [valid, setValid] = useState(false)
  const [query, setQuery] = useState('')
  const [groupBindings, setGroupBindings] = useState<Array<GroupBase>>(
    bindings ?? []
  )
  const [email, setEmail] = useState('')
  const [isAdmin, setAdmin] = useState(false)
  const [invite, setInvite] = useState<Invite>()

  const {
    data: groupsQuery,
    fetchMore,
    refetch: refetchGroups,
  } = useGroupsQuery({
    variables: { q: query },
  })

  const [createInvite, { loading, error }] = useCreateInviteMutation({
    variables: {
      attributes: {
        email,
        inviteGroups: groupBindings.map(
          (g) => ({ groupId: g.id } as BindingAttributes)
        ),
        admin: isAdmin,
        serviceAccountId,
        oidcProviderId,
      },
    },
    onCompleted: (result) => {
      setInvite(result?.createInvite as Invite)
      onInvite?.(result?.createInvite as Invite)
    },
  })

  useEffect(() => refetch?.(() => refetchGroups), [refetch, refetchGroups])

  return (
    <div {...props}>
      {error && (
        <GqlError
          error={error}
          header="Failed to invite user"
        />
      )}
      <EmailInput
        onValidityChange={setValid}
        onChange={setEmail}
      />
      <div className="divider" />
      <div className="switch">
        <Switch
          checked={isAdmin}
          onChange={({ target: { checked } }) => setAdmin(checked)}
        >
          <span className="message">Admin</span>
        </Switch>
      </div>
      <GroupBindingsComboBox
        onViewMore={() =>
          fetchMore({
            variables: { cursor: groupsQuery?.groups?.pageInfo?.endCursor },
            updateQuery: (prev, { fetchMoreResult: { groups } }) =>
              extendConnection(prev, groups, 'groups'),
          })
        }
        onInputChange={setQuery}
        onCreate={onGroupCreate}
        onSelect={(group) => setGroupBindings((groups) => [...groups, group])}
        onRemove={(group) =>
          setGroupBindings((groups) => groups.filter((g) => g.id !== group.id))
        }
        groups={toGroups(groupsQuery?.groups as GroupConnection)}
        preselected={bindings}
        hasMore={groupsQuery?.groups?.pageInfo.hasNextPage}
      />
      {invite && <InvitationMessage invite={invite} />}
      <InviteUserActions
        onCancel={onCancel}
        onBack={onBack}
        onCreate={createInvite}
        disabled={!valid || loading}
        loading={loading}
        invited={!!invite}
      />
    </div>
  )
}

export default InviteUser

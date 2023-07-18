import {
  Button,
  Chip,
  Codeline,
  ComboBox,
  FormField,
  Input,
  ListBoxFooter,
  ListBoxFooterPlus,
  ListBoxItem,
  ListBoxItemChipList,
  MailIcon,
  PeopleIcon,
  PeoplePlusIcon,
} from '@pluralsh/design-system'
import { Switch } from 'honorable'
import { debounce } from 'lodash'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import {
  BindingAttributes,
  Group,
  GroupConnection,
  Invite,
  useCreateInviteMutation,
  useGroupsQuery,
} from '../../../generated/graphql'
import { isValidEmail } from '../../../utils/email'
import { extendConnection } from '../../../utils/graphql'
import { GqlError } from '../../utils/Alert'
import { inviteLink } from '../utils'

import { toGroups } from './helpers'

import { EmailInputProps, GroupBase, GroupBindingsSelectorProps } from './types'

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

const GroupBindingsSelector = styled(GroupBindingsSelectorUnstyled)(
  ({ theme }) => ({
    '.content': {
      color: theme.colors['text-xlight'],

      '.leftContent': {
        color: theme.colors['icon-light'],
      },
    },

    '.create-group-footer': {
      ...theme.partials.text.body2,
      color: theme.colors['action-link-inline'],
    },
  })
)

const ChipList = styled(ListBoxItemChipList)(({ theme }) => ({
  marginTop: theme.spacing.small,
  justifyContent: 'start',
}))

function GroupBindingsSelectorUnstyled({
  onQueryChange,
  onGroupCreate,
  onGroupAdd,
  onGroupRemove,
  groups,
  selected,
  fetchMore,
  ...props
}: GroupBindingsSelectorProps): ReactElement {
  const placeholder = 'Search for a group'
  const [query, setQuery] = useState('')
  const [displayGroups, setDisplayGroups] = useState<Array<Group>>([])

  const throttledOnQueryChange = useMemo(
    () => debounce((value) => onQueryChange?.(value), 750),
    [onQueryChange]
  )

  useEffect(() => setDisplayGroups(toGroups(groups)), [groups])

  return (
    <FormField
      label="Group bindings"
      {...props}
    >
      <ComboBox
        inputValue={query}
        startIcon={<PeopleIcon />}
        inputProps={{ placeholder, showClearButton: true }}
        dropdownFooterFixed={
          <ListBoxFooter
            onClick={() => onGroupCreate?.()}
            leftContent={<PeoplePlusIcon color="icon-info" />}
            {...props}
          >
            <span className="create-group-footer">Create new group</span>
          </ListBoxFooter>
        }
        dropdownFooter={
          groups?.pageInfo?.hasNextPage ? (
            <ListBoxFooterPlus>View more</ListBoxFooterPlus>
          ) : undefined
        }
        onFooterClick={() =>
          fetchMore({
            variables: { cursor: groups?.pageInfo?.endCursor },
            updateQuery: (prev, { fetchMoreResult: { groups } }) =>
              extendConnection(prev, groups, 'groups'),
          })
        }
        onSelectionChange={(key) =>
          onGroupAdd?.(displayGroups?.find((g) => g.id === key) as GroupBase)
        }
        onInputChange={(value) => {
          setQuery(value)
          throttledOnQueryChange(value)
        }}
      >
        {displayGroups
          .filter((g) => !selected?.find((s) => g.id === s.id))
          .map((g) => (
            <ListBoxItem
              leftContent={<PeopleIcon />}
              key={g.id}
              label={g.name}
              description={g.description}
              textValue={g.name}
            />
          ))}
      </ComboBox>
      <ChipList
        maxVisible={Infinity}
        chips={[...(selected ?? [])].map((group) => (
          <Chip
            size="small"
            clickable
            onClick={() => onGroupRemove?.(group)}
            closeButton
          >
            {group.name}
          </Chip>
        ))}
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
  onClose,
  onCreate,
  invited,
  ...props
}): ReactElement {
  return (
    <div {...props}>
      {!invited && (
        <>
          <Button
            secondary
            onClick={onClose}
          >
            Cancel
          </Button>
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
          <Button onClick={onClose}>Done</Button>
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
  onClose,
  refetch,
  ...props
}): ReactElement {
  const [valid, setValid] = useState(false)
  const [query, setQuery] = useState('')
  const [groupBindings, setGroupBindings] = useState<Array<GroupBase>>([])
  const [email, setEmail] = useState('')
  const [invite, setInvite] = useState<Invite>()
  const [isAdmin, setAdmin] = useState(false)

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
      },
    },
    onCompleted: (result) => {
      setInvite(result?.createInvite as Invite)
      onInvite?.()
    },
  })

  const onAdd = useCallback(
    (group: GroupBase) =>
      group && setGroupBindings((selected) => [...selected, group]),
    []
  )

  const onRemove = useCallback(
    (group: GroupBase) =>
      group &&
      setGroupBindings((selected) => [
        ...selected.filter((s) => s.id !== group.id),
      ]),
    []
  )

  useEffect(() => refetch(() => refetchGroups), [refetch, refetchGroups])

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
      <GroupBindingsSelector
        onGroupCreate={onGroupCreate}
        onQueryChange={setQuery}
        onGroupAdd={onAdd}
        onGroupRemove={onRemove}
        groups={groupsQuery?.groups as GroupConnection}
        selected={groupBindings}
        fetchMore={fetchMore}
      />
      {invite && <InvitationMessage invite={invite} />}
      <InviteUserActions
        onClose={onClose}
        onCreate={createInvite}
        disabled={!valid || loading}
        loading={loading}
        invited={!!invite}
      />
    </div>
  )
}

export default InviteUser

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

interface EmailInputProps {
  onValidityChange?: (valid: boolean) => void
  onChange?: (value: string) => void
}

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

interface GroupBindingsSelectorProps {
  onGroupCreate?: () => void
  onQueryChange?: (query: string) => void
  onGroupAdd?: (group: GroupBase) => void
  onGroupRemove?: (group: GroupBase) => void
  groups?: GroupConnection
  selected?: Array<GroupBase>
  loading?: boolean
  fetchMore?: any
}

const toGroups = (connection?: GroupConnection): Array<Group> =>
  connection?.edges?.map((e) => e!.node!) ?? []

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
        inputProps={{ placeholder }}
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
          <span>
            Invite sent successfully. Use this secure link to finish the
            invitation process.
          </span>
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

interface GroupBase {
  id: string
  name: string
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
}))

function InviteUserUnstyled({
  onGroupCreate,
  onClose,
  ...props
}): ReactElement {
  const [valid, setValid] = useState(false)
  const [query, setQuery] = useState('')
  const [groupBindings, setGroupBindings] = useState<Array<GroupBase>>([])
  const [email, setEmail] = useState('')
  const [invite, setInvite] = useState<Invite>()

  const { data: groupsQuery, fetchMore } = useGroupsQuery({
    variables: { q: query },
  })

  const [createInvite, { loading, error }] = useCreateInviteMutation({
    variables: {
      attributes: {
        email,
        inviteGroups: groupBindings.map(
          (g) => ({ groupId: g.id } as BindingAttributes)
        ),
      },
    },
    onCompleted: (result) => setInvite(result?.createInvite as Invite),
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

import {
  Button,
  Callout,
  Chip,
  Flex,
  FormField,
  Input,
  ValidatedInput,
} from '@pluralsh/design-system'
import { useContext, useLayoutEffect, useMemo, useState } from 'react'
import { useTheme } from 'styled-components'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import {
  Account,
  DomainMapping,
  useConsumerEmailDomainsSuspenseQuery,
  useUpdateAccountMutation,
} from '../../generated/graphql'
import { useUpdateState } from '../../hooks/useUpdateState'
import { removeTypename } from '../../utils/removeTypename'
import { notNil, notNilAnd } from '../../utils/ts-notNil'
import { GqlError } from '../utils/Alert'
import { DeleteIconButton } from '../utils/IconButtons'
import { List, ListItem } from '../utils/List'
import SaveButton from '../utils/SaveButton'
import { SubpageCard, SubpageHeader } from '../utils/layout/SubpageLayout'

import { FROM_EMAIL_CONFIRMATION_KEY } from 'components/users/EmailConfirmation'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Confirm } from '../utils/Confirm'

type DomainMappingFuncProps = {
  mapping: DomainMapping
  remove: () => void
  first: boolean
  last: boolean
}

function DomainMappingFunc({
  mapping,
  remove,
  first,
  last,
}: DomainMappingFuncProps) {
  const theme = useTheme()
  const [confirm, setConfirm] = useState(false)

  return (
    <>
      <ListItem
        first={first}
        last={last}
      >
        <Flex
          gap="medium"
          alignItems="center"
        >
          <div css={{ width: '100%', flexGrow: 1 }}>
            <span css={{ fontWeight: 'bold' }}>{mapping.domain}</span>
          </div>
          <Flex
            flexDirection="row"
            alignItems="center"
            gap="small"
          >
            {mapping.enableSso && (
              <Chip
                severity="neutral"
                css={{
                  backgroundColor: theme.colors['fill-three'],
                  borderColor: theme.colors['border-input'],
                }}
              >
                SSO
              </Chip>
            )}
            <DeleteIconButton
              onClick={() => {
                setConfirm(true)
              }}
            />
          </Flex>
        </Flex>
      </ListItem>
      <Confirm
        title="Confirm deletion"
        text="Are you sure you want to delete this domain? This action is irreversible."
        label="Delete"
        open={confirm}
        close={() => {
          setConfirm(false)
        }}
        submit={() => {
          setConfirm(false)
          remove()
        }}
        destructive
      />
    </>
  )
}

function toFormState(account: Pick<Account, 'name' | 'domainMappings'>) {
  return {
    name: `${account?.name || ''}`,
    domainMappings: account?.domainMappings || [],
  }
}

export function AccountAttributes() {
  const theme = useTheme()
  const user = useContext(CurrentUserContext)
  const canEdit = useCanEdit()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: consumerEmailData } = useConsumerEmailDomainsSuspenseQuery()
  const [showDomainMappingCallout, setShowDomainMappingCallout] =
    useState(false)
  const curUserDomain = user.email.split('@')[1]

  const {
    state: formState,
    hasUpdates,
    update: updateFormState,
  } = useUpdateState(toFormState(user.account))

  const sortedDomainMappings = useMemo(
    () =>
      (formState.domainMappings || [])
        .filter(notNil)
        .sort((m1, m2) =>
          `${m1?.domain} || ''`
            .toLowerCase()
            .localeCompare(`${m2?.domain} || ''`.toLowerCase())
        ),
    [formState.domainMappings]
  )

  const [domain, setDomain] = useState(
    sortedDomainMappings?.some((m) => m?.domain === curUserDomain)
      ? ''
      : curUserDomain
  )

  const [mutation, { loading, error }] = useUpdateAccountMutation({
    variables: {
      attributes: {
        name: formState.name,
        domainMappings: formState.domainMappings,
      },
    },
    update: (_cache, { data }) => {
      if (data?.updateAccount) updateFormState(toFormState(data.updateAccount))
    },
  })

  const addDomain = (d: string) => {
    const newDomains = [
      { domain: d },
      ...(user.account?.domainMappings?.map(removeTypename) || []),
    ]

    mutation({ variables: { attributes: { domainMappings: newDomains } } })
  }

  const rmDomain = (d?: string) => {
    const newDomains = (user.account?.domainMappings || [])
      .filter(notNilAnd((mapping) => mapping?.domain !== d))
      .map(removeTypename)

    mutation({ variables: { attributes: { domainMappings: newDomains } } })
  }

  function handleAddDomain() {
    if (!domain) return
    addDomain(domain)
    setDomain('')
  }

  useLayoutEffect(() => {
    // only run this logic if we're coming from email confirmation
    if (!!user && searchParams.get(FROM_EMAIL_CONFIRMATION_KEY) === 'true') {
      const consumerDomains =
        consumerEmailData?.account?.consumerEmailDomains ?? []
      // if user is on a consumer domain, on an already-mapped domain, or is not an admin, they should just land on the home page
      if (
        consumerDomains.includes(curUserDomain) ||
        sortedDomainMappings.some(
          (mapping) => mapping?.domain === curUserDomain
        ) ||
        !canEdit
      ) {
        navigate('/')
      } else {
        setSearchParams({})
        setShowDomainMappingCallout(true)
      }
    }
  }, [
    user,
    searchParams,
    consumerEmailData,
    curUserDomain,
    sortedDomainMappings,
    domain,
    canEdit,
    navigate,
    setSearchParams,
    setShowDomainMappingCallout,
  ])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (hasUpdates) {
          mutation()
        }
      }}
      css={{
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: theme.spacing.large,
      }}
    >
      <SubpageHeader title="General">
        <SaveButton
          dirty={hasUpdates}
          loading={loading}
          error={!!error}
        />
      </SubpageHeader>
      <SubpageCard>
        {error && (
          <GqlError
            error={error}
            header="Something went wrong"
          />
        )}
        <ValidatedInput
          label="Organization name"
          value={formState.name}
          onChange={({ target: { value } }) => updateFormState({ name: value })}
        />
        {showDomainMappingCallout && (
          <Callout title="Configure email domains">
            We see you're using a work email. Please add a domain mapping to
            ensure all members of your organization can access your account.
          </Callout>
        )}
        <FormField
          label="Email domains"
          hint="Register email domains to automatically add users to your account"
        >
          <Flex gap="small">
            <div css={{ flexGrow: 1 }}>
              <Input
                value={domain}
                width="100%"
                placeholder="enter an email domain"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleAddDomain()
                  }
                }}
                onChange={({ target: { value } }) => setDomain(value)}
              />
            </div>
            <Button
              secondary
              type="button"
              disabled={!domain}
              onClick={() => {
                handleAddDomain()
              }}
            >
              Add
            </Button>
          </Flex>
        </FormField>
        {sortedDomainMappings.length > 0 && (
          <List hue="lighter">
            {sortedDomainMappings.map((mapping, i) => (
              <DomainMappingFunc
                key={mapping?.domain}
                mapping={mapping}
                first={i === 0}
                last={i === sortedDomainMappings.length - 1}
                remove={() => rmDomain(mapping?.domain)}
              />
            ))}
          </List>
        )}
      </SubpageCard>
    </form>
  )
}

function useCanEdit() {
  const user = useContext(CurrentUserContext)
  return !!user.roles?.admin || user.id === user.account?.rootUser?.id
}

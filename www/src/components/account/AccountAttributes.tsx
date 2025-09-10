import {
  Button,
  Callout,
  Chip,
  ContentCard,
  FormField,
  Input,
  PageTitle,
  ValidatedInput,
} from '@pluralsh/design-system'
import { Div, Flex, Form, Span } from 'honorable'
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
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
          gap={theme.spacing.medium}
          alignItems="center"
        >
          <Div
            fill="horizontal"
            flexGrow={1}
          >
            <Span fontWeight="bold">{mapping.domain}</Span>
          </Div>
          <Flex
            flexDirection="row"
            alignItems="center"
            gap="small"
          >
            {mapping.enableSso && (
              <Chip
                severity="neutral"
                backgroundColor="fill-three"
                borderColor="border-input"
              >
                SSO
              </Chip>
            )}
            <DeleteIconButton
              onClick={() => {
                setConfirm(true)
              }}
              hue="lighter"
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
        navigate('/overview')
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
    <Form
      onSubmit={(event) => {
        event.preventDefault()
        if (hasUpdates) {
          mutation()
        }
      }}
      display="flex"
      flexDirection="column"
      paddingBottom="large"
    >
      <PageTitle heading="Account attributes">
        <SaveButton
          dirty={hasUpdates}
          loading={loading}
          error={!!error}
        />
      </PageTitle>
      <ContentCard>
        <Flex
          flexDirection="column"
          gap="large"
        >
          {error && (
            <GqlError
              error={error}
              header="Something went wrong"
            />
          )}
          <ValidatedInput
            label="Account name"
            value={formState.name}
            onChange={({ target: { value } }) =>
              updateFormState({ name: value })
            }
          />
          {showDomainMappingCallout && (
            <Callout title="Configure domain mapping">
              We see you're using a work email. Please add a domain mapping to
              ensure all members of your organization can access your account.
            </Callout>
          )}
          <FormField
            label="Domain mappings"
            hint="Register email domains to automatically add users to your
                      account"
          >
            <Flex gap="medium">
              <Div flexGrow={1}>
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
              </Div>
              <Div>
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
              </Div>
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
        </Flex>
      </ContentCard>
    </Form>
  )
}

function useCanEdit() {
  const user = useContext(CurrentUserContext)
  return !!user.roles?.admin || user.id === user.account?.rootUser?.id
}

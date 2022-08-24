import { useMutation } from '@apollo/client'
import {
  ButtonProps, Div, Flex, Form, Span,
} from 'honorable'
import {
  Button,
  Card,
  CheckIcon,
  Chip,
  FormField,
  Input,
  ValidatedInput,
} from 'pluralsh-design-system'
import {
  useContext, useEffect, useMemo, useState,
} from 'react'
import { useTheme } from 'styled-components'

import usePrevious from 'hooks/usePrevious'

import { UPDATE_ACCOUNT } from '../accounts/queries'
import { CurrentUserContext } from '../login/CurrentUser'
import { PageHeader } from '../utils/PageHeader'
import { DeleteIcon } from '../profile/Icon'
import { GqlError } from '../utils/Alert'
import { Container } from '../utils/Container'
import { useUpdateState } from '../../hooks/useUpdateState'

import { List, ListItem } from './List'

function sanitize<T extends { [key: string]: any }>({
  __typename,
  ...rest
}: T) {
  return rest
}

function DomainMapping({ mapping, remove }: any) {
  const theme = useTheme()

  return (
    <ListItem
      hue="lighter"
      display="flex"
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
        <DeleteIcon
          {...{ onClick: remove }}
          hue="lighter"
        />
      </Flex>
    </ListItem>
  )
}

type DomainMappingProps = {
  __typename?: 'DomainMapping'
  id?: string
  domain?: string
  enableSso?: boolean
}
type RootUser = {
  __typename?: 'User'
  id?: 'string'
}
type Account = {
  __typename: 'Account'
  id?: string
  rootUser?: RootUser
  name?: string
  domainMappings?: DomainMappingProps[]
  backgroundColor?: string
  billingCustomerId?: string
}

function toFormState(account: Partial<Account>) {
  return {
    name: `${account?.name || ''}`,
    domainMappings: account?.domainMappings?.map(sanitize) || [],
  }
}

type SaveButtonProps = ButtonProps & {
  dirty?: boolean
  loading?: boolean
  error?: boolean
}

export function SaveButton({
  dirty,
  error,
  loading,
  ...props
}: SaveButtonProps) {
  const [showSaved, setShowSaved] = useState(false)
  const theme = useTheme()
  const previousLoading = usePrevious(loading)

  useEffect(() => {
    if (!loading && previousLoading && !error) {
      setShowSaved(true)
      const timeout = setTimeout(() => {
        setShowSaved(false)
      }, 2000)

      return () => {
        console.log('clear timeout')
        setShowSaved(false)
        clearTimeout(timeout)
      }
    }
  // If previousLoading is included in deps, showSave will immediately flip back
  // to false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error])

  return (
    <Flex>
      {(dirty || showSaved) && (
        <Flex
          marginRight="medium"
          alignItems="center"
          body2
          color={theme.colors['text-xlight']}
        >
          {dirty ? (
            <>
              Unsaved changes
            </>
          ) : (
            <>
              Saved <CheckIcon
                size={12}
                marginLeft={theme.spacing.xsmall}
                color={theme.colors['text-xlight']}
              />
            </>
          )}
        </Flex>
      )}
      <Button
        type="submit"
        loading={loading}
        disabled={!dirty}
        {...props}
      >
        Save
      </Button>
    </Flex>
  )
}

export function AccountAttributes() {
  const { account } = useContext(CurrentUserContext) as { account: Account }

  const {
    state: formState,
    hasUpdates,
    update: updateFormState,
    initialState: initialFormState,
  } = useUpdateState(toFormState(account))

  console.log('formstate', formState)
  console.log('intialFormState', initialFormState)

  const [domain, setDomain] = useState('')

  const sortedDomainMappings = useMemo(() => ([...(formState.domainMappings || [])]
    .sort((m1, m2) => `${m1.domain} || ''`
      .toLowerCase()
      .localeCompare(`${m2.domain} || ''`.toLowerCase()))), [formState.domainMappings])

  const [mutation, { loading, error }] = useMutation<
    { updateAccount: Partial<Account> },
    { attributes: Partial<Account> }
  >(UPDATE_ACCOUNT, {
    variables: {
      attributes: {
        name: formState.name,
        domainMappings: formState.domainMappings,
      },
    },
    update: (_cache, { data }) => {
      console.log('data')
      console.log('updateAccount', data?.updateAccount)
      if (data?.updateAccount) updateFormState(toFormState(data.updateAccount))
    },
  })

  const addDomain = (d: string) => updateFormState({
    domainMappings: !formState.domainMappings.find(({ domain }) => domain === d)
      ? [{ domain: d }, ...formState.domainMappings]
      : formState.domainMappings,
  })
  const rmDomain = (d?: string) => updateFormState({
    domainMappings: formState.domainMappings.filter(({ domain }) => domain !== d),
  })

  function handleAddDomain() {
    if (!domain) return
    addDomain(domain)
    setDomain('')
  }

  console.log('error', error)

  return (
    <Div>
      <Form
        onSubmit={event => {
          event.preventDefault()
          if (hasUpdates) {
            mutation()
          }
        }}
      >
        <PageHeader header={<Div>Account&nbsp;attributes</Div>}>
          <SaveButton
            dirty={hasUpdates}
            loading={loading}
            error={!!error}
          />
        </PageHeader>

        <Card padding="xlarge">
          <Container type="form">
            <Div
              fill
              gap="medium"
            >
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
                  onChange={({ target: { value } }) => updateFormState({ name: value })}
                />
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
                        onKeyDown={event => {
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
                          console.log('domain add', domain)
                          handleAddDomain()
                        }}
                      >
                        Add
                      </Button>
                    </Div>
                  </Flex>
                </FormField>
                {formState.domainMappings.length > 0 && (
                  <Card hue="lighter">
                    <List>
                      {formState.domainMappings.map(mapping => (
                        <DomainMapping
                          key={mapping.domain}
                          mapping={mapping}
                          remove={() => rmDomain(mapping.domain)}
                        />
                      ))}
                    </List>
                  </Card>
                )}
              </Flex>
            </Div>
          </Container>
        </Card>
      </Form>
    </Div>
  )
}

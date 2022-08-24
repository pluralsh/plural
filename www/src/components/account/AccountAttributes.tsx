import { useMutation } from '@apollo/client'
import { ButtonProps, Div, Flex, Form, Span } from 'honorable'
import {
  Button,
  Card,
  ContentCard,
  Chip,
  FormField,
  Input,
  ValidatedInput,
  PageTitle,
} from 'pluralsh-design-system'
import { ReactNode, useContext, useMemo, useState } from 'react'
import { useTheme } from 'styled-components'

import { UPDATE_ACCOUNT } from '../accounts/queries'
import { CurrentUserContext } from '../login/CurrentUser'
import { PageHeader } from '../utils/PageHeader'
import { DeleteIcon } from '../profile/Icon'
import { GqlError } from '../utils/Alert'
import { Container } from '../utils/Container'
import { useUpdateState } from '../../hooks/useUpdateState'

import { List, ListItem } from './List'
import { Confirm } from './Confirm'
import SaveButton from '../utils/SaveButton'

import { Account } from './Account'

function sanitize<T extends { [key: string]: any }>({
  __typename,
  ...rest
}: T) {
  return rest
}

function DomainMapping({ mapping, remove }: any) {
  const theme = useTheme()
  const [confirm, setConfirm] = useState(false)

  return (
    <>
      <ListItem
        hue="lighter"
        display="flex"
        gap={theme.spacing.medium}
        alignItems="center"
      >
        <Div fill="horizontal" flexGrow={1}>
          <Span fontWeight="bold">{mapping.domain}</Span>
        </Div>
        <Flex flexDirection="row" alignItems="center" gap="small">
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
            onClick={() => {
              setConfirm(true)
            }}
            hue="lighter"
          />
        </Flex>
      </ListItem>
      <Confirm
        title={'Confirm deletion'}
        text={
          'Are you sure you want to delete this domain? This action is irreversible.'
        }
        label={'Delete'}
        open={confirm}
        close={() => {
          setConfirm(false)
        }}
        submit={() => {
          setConfirm(false)
          remove()
        }}
        destructive={true}
      />
    </>
  )
}

function toFormState(account: Partial<Account>) {
  return {
    name: `${account?.name || ''}`,
    domainMappings: account?.domainMappings?.map(sanitize) || [],
  }
}

export function AccountAttributes() {
  const { account } = useContext(CurrentUserContext) as { account: Account }

  const {
    state: formState,
    hasUpdates,
    update: updateFormState,
    initialState: initialFormState,
  } = useUpdateState(toFormState(account))

  const [domain, setDomain] = useState('')

  const sortedDomainMappings = useMemo(
    () =>
      [...(formState.domainMappings || [])].sort((m1, m2) =>
        `${m1.domain} || ''`
          .toLowerCase()
          .localeCompare(`${m2.domain} || ''`.toLowerCase())
      ),
    [formState.domainMappings]
  )

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

  const addDomain = (d: string) => {
    const newDomains = [
      { domain: d },
      ...(account?.domainMappings?.map(sanitize) || []),
    ]

    mutation({ variables: { attributes: { domainMappings: newDomains } } })
  }

  const rmDomain = (d?: string) => {
    const newDomains = (account?.domainMappings || [])
      .filter(({ domain }) => domain !== d)
      .map(sanitize)

    mutation({ variables: { attributes: { domainMappings: newDomains } } })
  }

  function handleAddDomain() {
    if (!domain) return
    addDomain(domain)
    setDomain('')
  }

  return (
    <Form
      onSubmit={event => {
        event.preventDefault()
        if (hasUpdates) {
          mutation()
        }
      }}
      maxHeight="100%"
      display="flex"
      flexDirection="column"
    >
      <PageTitle heading={'Account attributes'}>
        <SaveButton dirty={hasUpdates} loading={loading} error={!!error} />
      </PageTitle>

      <ContentCard
        maxHeight="100%"
        overflowY="auto"
        paddingHorizontal={'xlarge'}
        paddingVertical={0}
        innerProps={{ padding: 0 }}
      >
        <Div paddingVertical={'xlarge'}>
          <Flex flexDirection="column" gap="large">
            {error && <GqlError error={error} header="Something went wrong" />}
            <ValidatedInput
              label="Account name"
              value={formState.name}
              onChange={({ target: { value } }) =>
                updateFormState({ name: value })
              }
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
      </ContentCard>
    </Form>
  )
}

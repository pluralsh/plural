import { useMutation } from '@apollo/client'
import { Box } from 'grommet'
import { Span } from 'honorable'
import { Button, Input, ValidatedInput } from 'pluralsh-design-system'
import { useContext, useState } from 'react'

import { UPDATE_ACCOUNT } from '../accounts/queries'

import { CurrentUserContext } from '../login/CurrentUser'
import { Header } from '../profile/Header'
import { DeleteIcon } from '../profile/Icon'
import { GqlError } from '../utils/Alert'

import { Chip } from './User'

const sanitize = ({ __typename, ...rest }) => rest

function DomainMapping({ mapping, remove }) {
  return (
    <Box
      pad="small"
      direction="row"
      align="center"
      round="xsmall"
      background="fill-one"
      border
    >
      <Box fill="horizontal">
        <Span fontWeight="bold">{mapping.domain}</Span>
      </Box>
      <Box
        direction="row"
        align="center"
        gap="small"
      >
        {mapping.enableSso && (
          <Chip
            text="SSO"
            color="text-light"
          />
        )}
        <DeleteIcon onClick={remove} />
      </Box>
    </Box>
  )
}

export function AccountAttributes() {
  const { account } = useContext(CurrentUserContext)
  const [name, setName] = useState(account.name) 
  const [domain, setDomain] = useState('')
  const [mutation, { loading, error }] = useMutation(UPDATE_ACCOUNT, { variables: { attributes: { name } } })
  const addDomain = domain => ([{ domain }, ...account.domainMappings.map(sanitize)])
  const rmDomain = d => account.domainMappings.filter(({ domain }) => domain !== d).map(sanitize)

  return (
    <Box
      fill
      gap="medium"
    >
      <Header
        header="Account Settings"
        description="Update basic account information here"
      >
        <Button
          onClick={mutation}
          loading={loading}
        >Save
        </Button> 
      </Header>
      <Box gap="medium">
        {error && (
          <GqlError
            error={error}
            header="Something went wrong"
          />
        )}
        <ValidatedInput
          label="Account name"
          value={name}
          onChange={({ target: { value } }) => setName(value)}
        />
        <Box gap="small">
          <Box gap="2px">
            <Span fontWeight="bold">Domain Mappings</Span>
            <Span color="text-light">Register email domains to automatically add users to your account</Span>
          </Box>
          <Box
            direction="row"
            align="center"
            gap="small"
          >
            <Input
              value={domain}
              onChange={({ target: { value } }) => setDomain(value)}
            />
            <Button
              small
              secondary
              onClick={() => mutation({ variables: { attributes: { domainMappings: addDomain(domain) } } })}
            >Add Domain
            </Button>
          </Box>
        </Box>
        <Box gap="xsmall">
          {account.domainMappings.map(mapping => (
            <DomainMapping
              mapping={mapping}
              remove={() => mutation({ variables: { attributes: { domainMappings: rmDomain(mapping.domain) } } })}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

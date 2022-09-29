import { useContext } from 'react'
import {
  A, Flex, Img, Input, MenuItem, Select, Text,
} from 'honorable'
import { FormField } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import { GITHUB_VALIDATIONS, useGithubState } from './github'
import { GITLAB_VALIDATIONS, useGitlabState } from './gitlab'
import { Provider } from './types'

export const SCM_VALIDATIONS = {
  [Provider.GITHUB]: GITHUB_VALIDATIONS,
  [Provider.GITLAB]: GITLAB_VALIDATIONS,
}

function OrgDisplay({ name, avatarUrl }) {
  return (
    <Flex
      direction="row"
      align="left"
      marginTop={avatarUrl ? '-2px' : 0}
    >
      {avatarUrl && (
        <Img
          borderRadius="medium"
          marginRight="xsmall"
          src={avatarUrl}
          display="block"
          width={24}
          height={24}
        />
      )}
      <Text
        body1
      >{name}
      </Text>
    </Flex>
  )
}

function OrgInput({ org, orgs, doSetOrg }) {
  const { scm: { provider }, authUrlData } = useContext(CreateShellContext)

  const altProvider = provider === Provider.GITHUB ? Provider.GITLAB : Provider.GITHUB
  const altProviderUrl = authUrlData?.scmAuthorization?.find(({ provider: p }) => p === altProvider)?.url

  function orgMapFunc(org) {
    let name
    let avatarUrl
    let key

    if (provider === Provider.GITHUB) {
      name = org.login
      avatarUrl = org.avatar_url
      key = org.id
    }
    else if (provider === Provider.GITLAB) {
      name = org.data.path || org.data.username
      avatarUrl = org.data.avatar_url
      key = org.id
    }

    return (
      <MenuItem
        key={key}
        value={org}
      >
        <OrgDisplay
          name={name}
          avatarUrl={avatarUrl}
        />
      </MenuItem>
    )
  }

  return (
    <FormField
      width="100%"
      label={
        provider === Provider.GITHUB
          ? 'GitHub organization'
          : provider === Provider.GITLAB
            ? 'GitLab group'
            : 'Organization or group'
      }
      caption={(
        <A
          inline
          href={altProviderUrl}
        >
          {`Switch to ${provider === Provider.GITHUB ? 'GitLab' : 'GitHub'}`}
        </A>
      )}
    >
      <Select
        width="100%"
        onChange={({ target: { value } }) => {
          doSetOrg(value)
        }}
        value={org || null}
      >
        {orgs?.map(orgMapFunc) || []}
      </Select>
    </FormField>
  )
}

function RepositoryInput({ scmState }) {
  const { scm, setScm } = useContext(CreateShellContext)

  function setName(name) {
    setScm({ ...scm, name })
  }

  const maxLen = 100

  return (
    <>
      <OrgInput
        {...scmState}
      />
      <FormField
        width="100%"
        marginTop="medium"
        label="Repository name"
        hint="This must be unique. Avoid generic names such as “plural-demo”."
        length={scm?.name?.length || 0}
        maxLength={maxLen}
      >
        <Input
          width="100%"
          onChange={({ target: { value } }) => setName(value.substring(0, maxLen))}
          value={scm.name}
          placeholder="Choose a repository name"
        />
      </FormField>
    </>
  )
}

function GithubRepositoryInput() {
  const { scm, setScm, accessToken } = useContext(CreateShellContext)
  const scmState = useGithubState({ scm, setScm, accessToken })

  return (
    <RepositoryInput scmState={scmState} />
  )
}

function GitlabRepositoryInput() {
  const { scm, setScm, accessToken } = useContext(CreateShellContext)
  const scmState = useGitlabState({ scm, setScm, accessToken })

  return (
    <RepositoryInput scmState={scmState} />
  )
}

export function ScmInput() {
  const { scm: { provider: scmProvider } } = useContext(CreateShellContext)

  if (scmProvider === Provider.GITHUB) {
    return (
      <GithubRepositoryInput />
    )
  }
  if (scmProvider === Provider.GITLAB) {
    return (
      <GitlabRepositoryInput />
    )
  }

  return null
}

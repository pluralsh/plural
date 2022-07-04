import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { A, Flex, Img, Input, MenuItem, P, Select, Text } from 'honorable'
import { Button, FormField } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import OnboardingNavSection from '../OnboardingNavSection'
import { Exceptions } from '../../validation'

import OnboardingCard from '../OnboardingCard'

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
          ? 'Github Organization'
          : provider === Provider.GITLAB
            ? 'Gitlab Group'
            : 'Organization or Group'
      }
      caption={(
        <A
          inline
          href={altProviderUrl}
        >
          {`Switch to ${provider === Provider.GITHUB ? 'Gitlab' : 'Github'}`}
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
        mt={1}
        label="Repository name"
        hint={(
          <Flex
            caption
            align="center"
            color="text-light"
          >
            <P
              flexGrow={1}
              color={false ? 'icon-error' : null}
            >
              This must be unique. Avoid generic names such as “plural-demo”.
            </P>
            <P ml={0.5}>
              {scm?.name?.length || 0} / {maxLen}
            </P>
          </Flex>
        )}
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

export function ScmSection() {
  const { exceptions, error, next } = useContext(CreateShellContext)
  const navigate = useNavigate()

  return (
    <>
      <OnboardingCard>
        <P
          body1
          color="text-light"
          marginBottom="medium"
        >
          We use GitOps to manage your application’s state. Use one of the following providers to get started.
        </P>
        <ScmInput />
        {exceptions && <Exceptions exceptions={exceptions} />}
      </OnboardingCard>
      <OnboardingNavSection>
        <Button
          secondary
          onClick={() => {
            navigate('/shell')
          }}
        >
          Back
        </Button>
        <Button
          disabled={error}
          onClick={() => next()}
        >Continue
        </Button>
      </OnboardingNavSection>
    </>
  )
}

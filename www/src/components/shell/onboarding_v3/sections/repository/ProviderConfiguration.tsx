import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flex,
  Img,
  Input,
  MenuItem,
  Select,
  Text,
} from 'honorable'
import { Button, FormField } from '@pluralsh/design-system'

import { OnboardingContext } from '../../context/onboarding'
import { ScmProvider } from '../../../../../generated/graphql'
import { isAlphanumeric } from '../../../validation'

import { useGithubState } from './provider/github'
import { useGitlabState } from './provider/gitlab'

function OrgDisplay({ name, avatarUrl }: any) {
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

function OrgInput({ org, orgs, doSetOrg }: any) {
  const { scm: { provider } } = useContext(OnboardingContext)

  const orgMapper = useCallback(org => {
    const menuItem = provider === ScmProvider.Github ? {
      name: org.login,
      avatarUrl: org.avatar_url,
      key: org.id,
    } : {
      name: org.data.path || org.data.username,
      avatarUrl: org.data.avatar_url,
      key: org.id,
    }

    return (
      <MenuItem
        key={menuItem.key}
        value={org}
      >
        <OrgDisplay
          name={menuItem.name}
          avatarUrl={menuItem.avatarUrl}
        />
      </MenuItem>
    )
  }, [provider])

  return (
    <FormField
      width="100%"
      label={
        provider === ScmProvider.Github
          ? 'GitHub organization'
          : provider === ScmProvider.Gitlab
            ? 'GitLab group'
            : 'Organization or group'
      }
    >
      <Select
        width="100%"
        onChange={({ target: { value } }) => doSetOrg(value)}
        value={org || null}
      >
        {orgs?.map(orgMapper) || []}
      </Select>
    </FormField>
  )
}

function RepositoryInput({ scmState }: any) {
  const { scm, setSCM, setValid } = useContext(OnboardingContext)
  const maxLen = 100
  const setName = useCallback((name: string) => setSCM({ ...scm, name }), [setSCM, scm])
  const isValid = useMemo(() => scm?.name?.length > 0 && !isAlphanumeric(scm?.name), [scm])

  useEffect(() => setValid(isValid), [isValid, setValid])

  return (
    <>
      <OrgInput
        {...scmState}
      />
      <FormField
        width="100%"
        marginTop="medium"
        label="Repository name"
        hint="Your repository's name must be globally unique."
        length={scm?.name?.length || 0}
        maxLength={maxLen}
        error={!isValid}
      >
        <Input
          error={!isValid}
          width="100%"
          onChange={({ target: { value } }) => setName(value.substring(0, maxLen))}
          value={scm?.name}
          placeholder="Choose a repository name"
        />
      </FormField>
    </>
  )
}

function GithubRepositoryInput() {
  const { scm, setSCM } = useContext(OnboardingContext)
  const scmState = useGithubState({ scm, setSCM })

  return (
    <RepositoryInput scmState={scmState} />
  )
}

function GitlabRepositoryInput() {
  const { scm, setSCM } = useContext(OnboardingContext)
  const scmState = useGitlabState({ scm, setSCM })

  return (
    <RepositoryInput scmState={scmState} />
  )
}

export function ProviderInput() {
  const { scm: { provider: scmProvider } } = useContext(OnboardingContext)

  if (scmProvider === ScmProvider.Github) {
    return (
      <GithubRepositoryInput />
    )
  }
  if (scmProvider === ScmProvider.Gitlab) {
    return (
      <GitlabRepositoryInput />
    )
  }

  return null
}

export function ProviderConfiguration({ onNext }) {
  // const { exceptions, error } = useContext(CreateShellContext)
  const { valid } = useContext(OnboardingContext)
  const navigate = useNavigate()

  return (
    <div>
      <ProviderInput />
      {/* {exceptions && <Exceptions exceptions={exceptions} />} */}
      <Flex
        gap="medium"
        justify="space-between"
        borderTop="1px solid border"
        marginTop="xlarge"
        paddingTop="large"
      >
        <Button
          secondary
          onClick={() => {
            navigate('/shell', { state: { hideSplashScreen: true, step: 1 } })
          }}
        >
          Back
        </Button>
        <Button
          disabled={!valid}
          onClick={onNext}
        >
          Continue
        </Button>
      </Flex>
    </div>
  )
}

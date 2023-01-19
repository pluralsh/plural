import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { Flex, Img, Input } from 'honorable'

import {
  Button,
  FormField,
  ListBoxItem,
  Select,
} from '@pluralsh/design-system'

import { OnboardingContext } from '../../context/onboarding'
import { ScmProvider } from '../../../../../generated/graphql'
import { isAlphanumeric } from '../../../helpers'
import { OrgType, SCMOrg } from '../../context/types'

import { useGithubState } from './provider/github'
import { useGitlabState } from './provider/gitlab'

interface OrgInputProps {
  orgs: Array<SCMOrg>
}

function OrgInput({ orgs }: OrgInputProps) {
  const { scm: { provider, org }, setSCM } = useContext(OnboardingContext)
  const setOrg = useCallback(org => setSCM(scm => ({ ...scm, org })), [setSCM])
  const setOrgByKey = useCallback(id => {
    const org = orgs.find(o => o.id === id)

    setSCM(scm => ({ ...scm, org }))
  }, [orgs, setSCM])

  useEffect(() => {
    if (org) return

    const userOrg = orgs.find(o => o.orgType === OrgType.User)

    if (!userOrg) return

    setOrg(userOrg)
  }, [org, orgs, setOrg])

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
        onSelectionChange={key => setOrgByKey(key)}
        selectedKey={org?.id}
        leftContent={org?.avatarUrl && (
          <Img
            borderRadius="medium"
            src={org?.avatarUrl}
            width={24}
            height={24}
          />
        )}
      >
        {orgs?.map(o => (
          <ListBoxItem
            key={o.id}
            label={o.name}
            textValue={o.name}
            leftContent={(
              <Img
                borderRadius="medium"
                marginRight="xsmall"
                src={o.avatarUrl}
                display="block"
                width={24}
                height={24}
              />
            )}
          />
        ))}
      </Select>
    </FormField>
  )
}

function RepositoryInput({ orgs }: any) {
  const { scm, setSCM, setValid } = useContext(OnboardingContext)
  const maxLen = 100
  const setName = useCallback((name: string) => setSCM({ ...scm, repositoryName: name }), [setSCM, scm])
  const isValid = useMemo(() => !!scm?.repositoryName?.length && !isAlphanumeric(scm?.repositoryName), [scm])

  useEffect(() => setValid(isValid), [isValid, setValid])

  return (
    <>
      <OrgInput orgs={orgs} />
      <FormField
        width="100%"
        marginTop="medium"
        label="Repository name"
        hint="Your repository's name must be globally unique."
        length={scm?.repositoryName?.length || 0}
        maxLength={maxLen}
        error={!isValid}
      >
        <Input
          error={!isValid}
          width="100%"
          onChange={({ target: { value } }) => setName(value.substring(0, maxLen))}
          value={scm?.repositoryName}
          placeholder="Choose a repository name"
        />
      </FormField>
    </>
  )
}

function GithubRepositoryInput() {
  const { scm } = useContext(OnboardingContext)
  const orgs = useGithubState({ token: scm.token })

  return (
    <RepositoryInput orgs={orgs} />
  )
}

function GitlabRepositoryInput() {
  const { scm } = useContext(OnboardingContext)
  const orgs = useGitlabState({ token: scm.token })

  return (
    <RepositoryInput orgs={orgs} />
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
  const { valid } = useContext(OnboardingContext)
  const navigate = useNavigate()

  return (
    <div>
      <ProviderInput />
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

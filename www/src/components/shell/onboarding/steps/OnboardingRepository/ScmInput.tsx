import {
  A,
  Flex,
  Img,
  Input,
  MenuItem,
  Select,
  Text,
} from 'honorable'
import { FormField } from 'pluralsh-design-system'

import { usePersistedGitData } from '../../../usePersistance'

import Provider from '../../common/providerTypes'

import useGithubState from './useGithubState'
import useGitlabState from './useGitlabState'

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
      >
        {name}
      </Text>
    </Flex>
  )
}

function OrgInput({ org, orgs, doSetOrg }) {
  const [{ scm: { provider }, authUrlData }] = usePersistedGitData()

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
  const [{ scm }, setGitData] = usePersistedGitData()
  const maxLen = 100

  function setName(name) {
    setGitData(x => ({ ...x, scm: { ...x.scm, name } }))
  }

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
  const [{ scm, accessToken }, setGitData] = usePersistedGitData()
  const setScm = scm => setGitData(x => ({ ...x, scm }))
  const scmState = useGithubState({ scm, setScm, accessToken })

  return (
    <RepositoryInput scmState={scmState} />
  )
}

function GitlabRepositoryInput() {
  const [{ scm, accessToken }, setGitData] = usePersistedGitData()
  const setScm = scm => setGitData(x => ({ ...x, scm }))
  const scmState = useGitlabState({ scm, setScm, accessToken })

  return (
    <RepositoryInput scmState={scmState} />
  )
}

export function ScmInput() {
  const [{ scm }] = usePersistedGitData()

  if (scm.provider === Provider.GITHUB) {
    return (
      <GithubRepositoryInput />
    )
  }
  if (scm.provider === Provider.GITLAB) {
    return (
      <GitlabRepositoryInput />
    )
  }

  return null
}

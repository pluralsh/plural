import { A, Div, Flex, Img, Input, P, Text } from 'honorable'

import { FormField, Select } from 'pluralsh-design-system'

import { GITHUB_VALIDATIONS, useGithub } from './github'
import { GITLAB_VALIDATIONS, GitlabRepositoryInput } from './gitlab'
import { Provider } from './types'

export const SCM_VALIDATIONS = {
  [Provider.GITHUB]: GITHUB_VALIDATIONS,
  [Provider.GITLAB]: GITLAB_VALIDATIONS,
}

function OrgDisplay({ name, avatarUrl }) {
  return (
    <Flex
      direction="row"
      gap={1}
      align="left"
      pad={1}
      mt={avatarUrl ? '-2px' : 0}
    >
      {avatarUrl && (
        <Img
          borderRadius="normal"
          mr={0.5}
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
  return (
    <FormField
      width="100%"
      label="Github account"
      caption={(
        <A
          inline
          href=""
        >{`Switch to ${'github' === 'github' ? 'Gitlab' : 'Github'}`}
        </A>
      )}
    >
      <Select
        width="100%"
        items={orgs?.map(org => ({
          key: org.id,
          label: <OrgDisplay
            name={org.login}
            avatarUrl={org.avatar_url}
          />,
          value: org.id,
        })) || []}
        onChange={e => {
          console.log('debug e', e)
          console.log('debug target', e.target)
          console.log('debug value', e.target.value)
    // setSelectedOrg(e?.target?.value)
    // doSetOrg(target.value) 
        }}
        value={null}
      />
    </FormField>
  )
}

function RepositoryInput({ provider, scm, setScm, accessToken }) {
  // console.log('debug scm1:', scm,)
  // console.log('debug setScm1:', setScm)
  // console.log('debug accessToken1:', accessToken)

  let providerProps
  if (provider === Provider.GITHUB) {
    providerProps = useGithub({ scm, setScm, accessToken })
  }
  else if (provider === Provider.GITLAB) {
    providerProps = useGitlab({ scm, setScm, accessToken })
  }
  else {
    return null
  }
  const { org, orgs, doSetOrg } = providerProps
  // console.log('debug org:', org)
  // console.log('debug orgs:', orgs)
  // console.log('debug doSetOrg:', doSetOrg)

  function setName(name) {
    setScm({ ...scm, name })
  }
  
  const maxLen = 160

  return (
    <>
      <OrgInput {...providerProps} />
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
          onChange={({ target: { value } }) => setName(value)}
          placeholder="Choose a repository name"
        />
      </FormField>
    </>
  )
}

export function ScmInput({ provider, accessToken, scm, setScm }) {
  if (provider === Provider.GITHUB) {
    return (
      <RepositoryInput
        provider={provider}
        accessToken={accessToken}
        scm={scm}
        setScm={setScm}
      />
    )
  }

  if (provider === Provider.GITLAB) {
    return (
      <GitlabRepositoryInput
        accessToken={accessToken}
        scm={scm}
        setScm={setScm}
      />
    )
  }

  return null
}

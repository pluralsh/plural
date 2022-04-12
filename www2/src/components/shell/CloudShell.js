import React, { useCallback, useEffect, useState } from 'react'
import { Box, Text } from 'grommet'
import { Github } from 'grommet-icons'
import { useHistory, useLocation } from 'react-router'
import { useMutation, useQuery } from 'react-apollo'
import { Button } from 'forge-core'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { GqlError } from '../utils/Alert'

import { AUTH_URLS, CLOUD_SHELL, CREATE_SHELL, REBOOT_SHELL, SCM_TOKEN } from './query'
import { GITHUB_VALIDATIONS, GithubRepositoryInput } from './scm/github'
import { WORKSPACE_VALIDATIONS, WorkspaceForm } from './WorkspaceForm'
import { Terminal } from './Terminal'
import { Exceptions, getExceptions } from './validation'
import { CLOUD_VALIDATIONS, ProviderForm, synopsis } from './cloud/provider'

const SECTIONS = {
  git: ['cloud', null],
  cloud: ['workspace', 'git'],
  workspace: ['finish', 'cloud'],
  finish: [null, 'workspace'],
}

const VALIDATIONS = {
  git: GITHUB_VALIDATIONS,
  workspace: WORKSPACE_VALIDATIONS,
}

function SynopsisTable({ items, width }) {
  return (
    <Box
      gap="xsmall"
      border={{ side: 'between' }}
    >
      {items.map(({ name, value }) => (
        <Box
          direction="row"
          key={name}
          gap="small"
          align="center"
        >
          <Box
            flex={false}
            width={width || '120px'}
          ><Text
              size="small"
            weight={500}
            >{name}
           </Text>
          </Box> 
          <Box fill="horizontal">{value}</Box>
        </Box>
      ))}
    </Box>
  )
}

function SynopsisSection({ header, children }) {
  return (
    <Box
      pad="small"
      round="xsmall"
      background="card"
      gap="xsmall"
    >
      <Box
        direction="row"
        justify="center"
      >
        <Text
          size="small"
          weight={500}
        >{header}
        </Text>
      </Box>
      {children}
    </Box>
  )
}

function SecondaryButton({ label, onClick }) {
  return (
    <Button
      background="sidebarHover"
      label={label}
      onClick={onClick}
    />
  )
}

function Synopsis({ scm, credentials, workspace, provider }) {
  return (
    <Box gap="small">
      <Text size="small">You've completed the configuration for your shell, but let's verify everything looks good just to be safe</Text>
      <Box
        gap="medium"
        direction="row"
      >
        <SynopsisSection header="Git Setup">
          <SynopsisTable
            width="80px"
            items={[{ name: 'Repository', value: scm.org ? `${scm.org}/${scm.name}` : scm.name }]}
          />
        </SynopsisSection>
        <SynopsisSection header="Cloud Credentials">
          <SynopsisTable items={synopsis({ provider, credentials, workspace })} />
        </SynopsisSection>
        <SynopsisSection header="Workspace">
          <SynopsisTable
            width="100px"
            items={[
              { name: 'Cluster', value: workspace.cluster },
              { name: 'Bucket Prefix', value: workspace.bucketPrefix },
              { name: 'Subdomain', value: workspace.subdomain },
            ]}
          />
        </SynopsisSection>
      </Box>
    </Box>
  )
}

export function Header({ text }) {
  return (
    <Box
      fill="horizontal"
      align="center"
      pad="small"
    >
      <Text
        size="small"
        weight={500}
      >{text}
      </Text>
    </Box>
  )
}

function CreateShell({ accessToken, onCreate }) {
  const [section, setSection] = useState('git')
  const [provider, setProvider] = useState('AWS')
  const [scm, setScm] = useState({ name: '', provider: 'GITHUB', token: accessToken })
  const [credentials, setCredentials] = useState({})
  const [workspace, setWorkspace] = useState({})
  const [mutation, { loading, error: gqlError }] = useMutation(CREATE_SHELL, {
    variables: { attributes: { credentials, workspace, scm, provider } },
    onCompleted: onCreate,
  })

  const doSetProvider = useCallback(provider => {
    setProvider(provider)
    setCredentials({})
    setWorkspace({ ...workspace, region: null })
  }, [setProvider, setCredentials, setWorkspace])

  const next = useCallback(() => {
    const hasNext = !!SECTIONS[section][0]
    if (hasNext) setSection(SECTIONS[section][0])
    if (!hasNext) mutation()
  }, [section, mutation])

  const validations = section === 'cloud' ? CLOUD_VALIDATIONS[provider] : VALIDATIONS[section]
  const { error, exceptions } = getExceptions(validations, { credentials, workspace, scm })

  return (
    <Box
      style={{ overflow: 'auto', height: '100%', width: '100%' }} 
      background="backgroundColor"
      align="center"
      justify="center"
      pad="small"
    >
      <Box
        flex={false}
        gap="small"
        width={section !== 'finish' ? '50%' : null}
      >
        {exceptions && <Exceptions exceptions={exceptions} />}
        {gqlError && (
          <GqlError
            error={gqlError}
            header="Failed to create shell"
          />
        )}
        {section === 'git' && (
          <>
            <Header text="Git Setup" />
            <GithubRepositoryInput
              accessToken={accessToken}
              scm={scm}
              setScm={setScm}
            />
          </>
        )}
        {section === 'cloud' && (
          <ProviderForm 
            provider={provider}
            setProvider={doSetProvider}
            workspace={workspace}
            setWorkspace={setWorkspace}
            credentials={credentials} 
            setCredentials={setCredentials}
          />
        )}
        {section === 'workspace' && (
          <>
            <Header text="Workspace" />
            <WorkspaceForm
              workspace={workspace}
              setWorkspace={setWorkspace}
            />
          </>
        )}
        {section === 'finish' && (
          <Synopsis
            provider={provider}
            workspace={workspace}
            credentials={credentials}
            scm={scm}
          />
        )}
        <Box
          direction="row"
          justify="end"
          gap="small"
        >
          {SECTIONS[section][1] && (
            <SecondaryButton 
              label="Previous" 
              onClick={() => setSection(SECTIONS[section][1])}
            />
          )}
          <Button 
            onClick={next} 
            border={!!error}
            disabled={error}
            loading={loading} 
            label={section !== 'finish' ? 'Next' : 'Create'}
          />
        </Box>
      </Box>
    </Box>
  )
}

export function OAuthCallback() {
  const loc = useLocation()
  const history = useHistory()
  const params = new URLSearchParams(loc.search)
  const { data } = useQuery(SCM_TOKEN, { variables: { code: params.get('code'), provider: 'GITHUB' } })

  if (!data) return <LoopingLogo dark />

  console.log(data)

  return (
    <Box
      background="backgroundColor"
      fill
      align="center"
      justify="center"
    >
      <CreateShell 
        accessToken={data.scmToken} 
        onCreate={() => history.push('/shell')}
      />
    </Box>
  )
}

export function CloudShell() {
  const { data } = useQuery(AUTH_URLS)
  const { data: shellData } = useQuery(CLOUD_SHELL, { fetchPolicy: 'cache-and-network' })
  const [mutation] = useMutation(REBOOT_SHELL)
  const [created, setCreated] = useState(false)
  const onClick = useCallback(() => {
    if (!data) return
    const [{ url }] = data.scmAuthorization 
    window.location = url
  }, [data])

  useEffect(() => {
    if (shellData && shellData.shell && !shellData.shell.alive) {
      mutation()
      setCreated(true)
    }
  }, [shellData, setCreated])

  if (!shellData) return <LoopingLogo dark />
  
  if ((shellData && shellData.shell) || created) return <Terminal />

  return (
    <Box
      background="backgroundColor"
      fill
      align="center"
      justify="center"
    >
      <Box
        flex={false}
        pad="small"
        round="xsmall"
        direction="row"
        gap="small"
        border
        align="center"
        hoverIndicator="card"
        onClick={onClick}
      >
        <Github size="15px" />
        <Text
          size="small"
          weight={500}
        >Log In With Github To Start
        </Text>
      </Box>
    </Box>
  )
}

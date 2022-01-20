import React, { useCallback, useEffect, useState } from 'react'
import { Box, Text } from 'grommet'
import { Github } from 'grommet-icons'
import { useLocation } from 'react-router'
import { useMutation, useQuery } from 'react-apollo'
import { Button } from 'forge-core'
import { AUTH_URLS, CLOUD_SHELL, CREATE_SHELL, REBOOT_SHELL, SCM_TOKEN } from './query'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { GithubRepositoryInput, GITHUB_VALIDATIONS } from './scm/github'
import { AwsForm, AWS_VALIDATIONS } from './cloud/aws'
import { WorkspaceForm, WORKSPACE_VALIDATIONS } from './WorkspaceForm'
import { Terminal } from './Terminal'
import { Exceptions, getExceptions } from './validation'

const SECTIONS = {
  'git': ['cloud', null],
  'cloud': ['workspace', 'git'],
  'workspace': ['finish', 'cloud'],
  'finish': [null, 'workspace']
}

const VALIDATIONS = {
  'git': GITHUB_VALIDATIONS,
  'cloud': AWS_VALIDATIONS,
  'workspace': WORKSPACE_VALIDATIONS
}

function SynopsisTable({items, width}) {
  return (
    <Box gap='xsmall' border={{side: 'between'}}>
      {items.map(({name, value}) => (
        <Box direction='row' key={name} gap='small' align='center'>
          <Box flex={false} width={width || '120px'}><Text size='small' weight={500}>{name}</Text></Box> 
          <Box fill='horizontal'>{value}</Box>
        </Box>
      ))}
    </Box>
  )
}

function SynopsisSection({header, children}) {
  return (
    <Box pad='small' round='xsmall' background='card' gap='xsmall'>
      <Box direction='row' justify='center'>
        <Text size='small' weight={500}>{header}</Text>
      </Box>
      {children}
    </Box>
  )
}

const SecondaryButton = ({label, onClick}) => <Button background='sidebarHover' label={label} onClick={onClick} />

function Synopsis({scm, credentials, workspace}) {
  return (
    <Box gap='small'>
      <Text size='small'>You've completed the configuration for your shell, but let's verify everything looks good just to be safe</Text>
      <Box gap='medium' direction='row'>
        <SynopsisSection header='Git Setup'>
          <SynopsisTable width='80px' items={[{name: 'Repository', value: scm.org ? `${scm.org}/${scm.name}` : scm.name}]} />
        </SynopsisSection>
        <SynopsisSection header='Cloud Credentials'>
          <SynopsisTable items={[
            {name: "Region", value: workspace.region},
            {name: 'Access Key Id', value: credentials.aws.accessKeyId},
            {name: 'Secret Access Key', value: credentials.aws.secretAccessKey}
          ]} />
        </SynopsisSection>
        <SynopsisSection header='Workspace'>
          <SynopsisTable width='100px' items={[
            {name: 'Cluster', value: workspace.cluster},
            {name: 'Bucket Prefix', value: workspace.bucketPrefix},
            {name: 'Subdomain', value: workspace.subdomain},
          ]} />
        </SynopsisSection>
      </Box>
    </Box>
  )
}

function Header({text}) {
  return (
    <Box fill='horizontal' align='center' pad='small'>
      <Text size='small' weight={500}>{text}</Text>
    </Box>
  )
}

function CreateShell({accessToken, onCreate}) {
  const [section, setSection] = useState('git')
  const [scm, setScm] = useState({name: '', provider: 'GITHUB', token: accessToken})
  const [credentials, setCredentials] = useState({})
  const [workspace, setWorkspace] = useState({})
  const [mutation, {loading}] = useMutation(CREATE_SHELL, {
    variables: {attributes: {credentials, workspace, scm, provider: "AWS"}},
    onCompleted: onCreate
  })
  const next = useCallback(() => {
    const hasNext = !!SECTIONS[section][0]
    if (hasNext) setSection(SECTIONS[section][0])
    if (!hasNext) mutation()
  }, [section, mutation])

  const validations = VALIDATIONS[section]
  const {error, exceptions} = getExceptions(validations, {credentials, workspace, scm})

  return (
    <Box style={{overflow: 'auto', height: '100%', width: '100%'}} 
         background='backgroundColor' align='center' justify='center' pad='small'>
      <Box flex={false} gap='small' width={section !== 'finish' ? '40%' : null}>
        {exceptions && <Exceptions exceptions={exceptions} />}
        {section === 'git' && (
          <>
          <Header text='Git Setup' />
          <GithubRepositoryInput accessToken={accessToken} scm={scm} setScm={setScm} />
          </>
        )}
        {section === 'cloud' && (
          <>
          <Header text='Cloud Credentials' />
          <AwsForm
            workspace={workspace}
            setWorkspace={setWorkspace}
            credentials={credentials} 
            setCredentials={setCredentials} />
          </>
        )}
        {section === 'workspace' && (
          <>
          <Header text='Workspace' />
          <WorkspaceForm workspace={workspace} setWorkspace={setWorkspace} />
          </>
        )}
        {section === 'finish' && (
          <Synopsis workspace={workspace} credentials={credentials} scm={scm} />
        )}
        <Box direction='row' justify='end' gap='small'>
          {SECTIONS[section][1] && (
            <SecondaryButton 
              label='Previous' 
              onClick={() => setSection(SECTIONS[section][1])} />
          )}
          <Button 
            onClick={next} 
            border={!!error}
            disabled={error}
            loading={loading} 
            label={section !== 'finish' ? 'Next' : 'Create'} />
        </Box>
      </Box>
    </Box>
  )
}

function OAuthCallback({code, onCreate}) {
  const {data} = useQuery(SCM_TOKEN, {variables: {code, provider: 'GITHUB'}})

  if (!data) return <LoopingLogo />

  return (
    <Box fill align='center' justify='center'>
      <CreateShell accessToken={data.scmToken} onCreate={onCreate} />
    </Box>
  )
}

export function CloudShell() {
  const loc = useLocation()
  const params = new URLSearchParams(loc.search)
  const {data} = useQuery(AUTH_URLS)
  const {data: shellData} = useQuery(CLOUD_SHELL)
  const [mutation] = useMutation(REBOOT_SHELL)
  const [created, setCreated] = useState(false)
  const onClick = useCallback(() => {
    if (!data) return
    const [{url}] = data.scmAuthorization 
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


  if (params.get('code')) return (
    <OAuthCallback 
      code={params.get('code')} 
      onCreate={() => setCreated(true)} />
  )

  return (
    <Box background='backgroundColor' fill align='center' justify='center'>
      <Box flex={false} pad='small' round='xsmall' direction='row' gap='small' border
           align='center' hoverIndicator='card' onClick={onClick}>
        <Github size='15px' />
        <Text size='small' weight={500}>Log In With Github To Start</Text>
      </Box>
    </Box>
  )
}
import React, { useCallback, useEffect, useState } from 'react'
import { Box, Table, TableCell, Text } from 'grommet'
import { Github } from 'grommet-icons'
import { useLocation } from 'react-router'
import { useMutation, useQuery } from 'react-apollo'
import { Divider, Button, SecondaryButton } from 'forge-core'
import { AUTH_URLS, CLOUD_SHELL, CREATE_SHELL, REBOOT_SHELL, SCM_TOKEN } from './query'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { GithubRepositoryInput } from './scm/github'
import { AwsForm } from './cloud/aws'
import { WorkspaceForm } from './WorkspaceForm'
import { TableRow } from '../accounts/Domains'
import { Terminal } from './Terminal'

const SECTIONS = {
  'git': ['cloud', null],
  'cloud': ['workspace', 'git'],
  'workspace': ['finish', 'cloud'],
  'finish': [null, 'workspace']
}

function SynopsisTable({items}) {
  return (
    <Table>
      {items.map(({name, value}) => (
        <TableRow key={name}>
          <TableCell scope="row">
            <strong>{name}</strong>
          </TableCell>
          <TableCell>{value}</TableCell>
        </TableRow>
      ))}
    </Table>
  )
}

function SynopsisSection({header, children}) {
  return (
    <Box pad='small' round='xsmall' background='tone-light' gap='xsmall'>
      <Box direction='row' justify='center'>
        <Text size='small' weight={500}>{header}</Text>
      </Box>
      {children}
    </Box>
  )
}

function Synopsis({scm, credentials, workspace}) {
  return (
    <Box gap='small'>
      <Text>You've completed the configuration for your shell, but let's verify everything looks good just to be safe</Text>
      <Box gap='medium' direction='row'>
        <SynopsisSection header='Git Setup'>
          <SynopsisTable items={[{name: 'Repository', value: scm.org ? `${scm.org}/${scm.name}` : scm.name}]} />
        </SynopsisSection>
        <SynopsisSection header='Cloud Credentials'>
          <SynopsisTable items={[
            {name: "Region", value: workspace.region},
            {name: 'Access Key Id', value: credentials.aws.accessKeyId},
            {name: 'Secret Access Key', value: credentials.aws.secretAccessKey}
          ]} />
        </SynopsisSection>
        <SynopsisSection header='Workspace'>
          <SynopsisTable items={[
            {name: 'Cluster', value: workspace.cluster},
            {name: 'Bucket Prefix', value: workspace.bucketPrefix},
            {name: 'Subdomain', value: workspace.subdomain},
          ]} />
        </SynopsisSection>
      </Box>
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
    if (section !== 'finish') setSection(SECTIONS[section][0])
    if (section === 'finish') mutation()
  }, [section, mutation])
  
  console.log(accessToken)

  return (
    <Box style={{overflow: 'auto', height: '100%', width: '100%'}} align='center' justify='center' pad='small'>
      <Box flex={false} gap='small' width={section !== 'finish' ? '40%' : null}>
        {section === 'git' && (
          <>
          <Divider text='Git Setup' />
          <GithubRepositoryInput accessToken={accessToken} scm={scm} setScm={setScm} />
          </>
        )}
        {section === 'cloud' && (
          <>
          <Divider text='Cloud Credentials' />
          <AwsForm
            workspace={workspace}
            setWorkspace={setWorkspace}
            credentials={credentials} 
            setCredentials={setCredentials} />
          </>
        )}
        {section === 'workspace' && (
          <>
          <Divider text='Workspace' />
          <WorkspaceForm workspace={workspace} setWorkspace={setWorkspace} />
          </>
        )}
        {section === 'finish' && (
          <Synopsis workspace={workspace} credentials={credentials} scm={scm} />
        )}
        <Box direction='row' justify='end' gap='small'>
          {section !== 'git' && <SecondaryButton label='Previous' onClick={() => setSection(SECTIONS[section][1])} />}
          <Button 
            onClick={next} 
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

  if (!shellData) return <LoopingLogo />
  
  if (shellData || created) return <Terminal />

  if (params.get('code')) return (
    <OAuthCallback 
      code={params.get('code')} 
      onCreate={() => setCreated(true)} />
  )

  return (
    <Box fill align='center' justify='center'>
      <Box flex={false} pad='small' round='xsmall' direction='row' gap='small' border
           align='center' hoverIndicator='tone-light' onClick={onClick}>
        <Github size='15px' />
        <Text size='small' weight={500}>Log In With Github To Start</Text>
      </Box>
    </Box>
  )
}
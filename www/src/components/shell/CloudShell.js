import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box } from 'grommet'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { BrowserIcon, CloudIcon, GearTrainIcon, GitHubIcon, Stepper } from 'pluralsh-design-system'
import { Button, Div, Flex, H2, P, Text } from 'honorable'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { GqlError } from '../utils/Alert'

import { AUTH_URLS, CLOUD_SHELL, CREATE_SHELL, REBOOT_SHELL, SCM_TOKEN } from './query'
import { GITHUB_VALIDATIONS } from './scm/github'
import { WORKSPACE_VALIDATIONS, WorkspaceForm } from './WorkspaceForm'
import { Terminal } from './Terminal'
import { Exceptions, getExceptions } from './validation'
import { CLOUD_VALIDATIONS, ProviderForm, synopsis } from './cloud/provider'
import { SCM_VALIDATIONS, ScmInput } from './scm/ScmInput'
import { Github as GithubLogo, Gitlab as GitlabLogo } from './icons'

import SplashToLogoTransition from './SplashToLogoTransition'

const DEBUG_SCM_TOKENS = {
  GITLAB: '9e7791d508144a21bb16dabba26f19344a70489d12844945ea4414f4c74895ff',
  GITHUB: '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',
}

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
          >
            <Text
              size="small"
              weight={500}
            >
              {name}
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

function Synopsis({ scm, credentials, workspace, provider, demo }) {
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
        {!demo && (
          <SynopsisSection header="Cloud Credentials">
            <SynopsisTable items={synopsis({ provider, credentials, workspace })} />
          </SynopsisSection>
        )}
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

function getValidations(provider, scmProvider, section) {
  if (section === 'cloud') return CLOUD_VALIDATIONS[provider]
  if (section === 'git') return SCM_VALIDATIONS[scmProvider]

  return VALIDATIONS[section]
}

function CreateShell({ accessToken, onCreate, provider: scmProvider }) {
  const [demo, setDemo] = useState(null)
  const [section, setSection] = useState('git')
  const [providerName, setProvider] = useState('AWS')
  const [scm, setScm] = useState({ name: '', provider: scmProvider, token: accessToken })
  const [credentials, setCredentials] = useState({})
  const [workspace, setWorkspace] = useState({})
  const [mutation, { loading, error: gqlError }] = useMutation(CREATE_SHELL, {
    variables: { attributes: { credentials, workspace, scm, provider: providerName, demoId: demo && demo.id } },
    onCompleted: onCreate,
  })
  const navigate = useNavigate()

  console.log('debug scm', scm)

  const doSetProvider = useCallback(provider => {
    setProvider(provider)
    setCredentials({})
    setWorkspace({ ...workspace, region: null })
  }, [setProvider, setCredentials, setWorkspace, workspace])

  const next = useCallback(() => {
    const hasNext = !!SECTIONS[section][0]
    if (hasNext) setSection(SECTIONS[section][0])
    if (!hasNext) mutation()
  }, [section, mutation])

  const validations = getValidations(providerName, scmProvider, section)
  const { error, exceptions } = getExceptions(validations, { credentials, workspace, scm })

  console.log('debug validations:', validations)
  console.log('debug exceptions', exceptions)
  console.log('debug errors', error)

  let stepIndex = 0
  switch (section) {
    case 'git':
      stepIndex = 0
      break
    case 'cloud':
      stepIndex = 1
      break
    case 'workspace':
      stepIndex = 2
      break
    case 'finish':
      stepIndex = 3
      break
  }

  return (
    <DemoWrapper stepIndex={stepIndex}>

      {section === 'git' && (
        <>
          <DemoCard>
            <P
              body1
              color="text-light"
              mb={1}
            >
              We use GitOps to manage your application’s state. Use one of the following providers to get started.
            </P>
            <ScmInput
              provider={scmProvider}
              accessToken={accessToken}
              scm={scm}
              setScm={setScm}
            />
            {exceptions && (!demo || section !== 'cloud') && <Exceptions exceptions={exceptions} />}

          </DemoCard>
          {/* Navigation */}
          <Flex
            mt={3}
            justify="space-between"
          >
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
          </Flex>
        </>
      )}
      {section === 'cloud' && (
        <ProviderForm
          provider={providerName}
          setProvider={doSetProvider}
          workspace={workspace}
          setWorkspace={setWorkspace}
          credentials={credentials}
          setCredentials={setCredentials}
          demo={demo}
          setDemo={setDemo}
          next={next}
        />
      )}
      {section === 'workspace' && (
        <>
          <Header text="Workspace" />
          <WorkspaceForm
            demo={demo}
            workspace={workspace}
            setWorkspace={setWorkspace}
          />
        </>
      )}
      {section === 'finish' && (
        <Synopsis
          provider={providerName}
          workspace={workspace}
          credentials={credentials}
          demo={demo}
          scm={scm}
        />
      )}
      {/* Errors */}
      <Div
        flex={false}
        gap="small"
        width={section !== 'finish' ? '50%' : null}
      >
        {gqlError && (
          <GqlError
            error={gqlError}
            header="Failed to create shell"
          />
        )}
      </Div>

    </DemoWrapper>
  )
}

export function OAuthCallback({ provider }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  let { data } = useQuery(SCM_TOKEN, {
    variables: {
      code: searchParams.get('code'),
      provider: provider.toUpperCase(),
    },
  })

  // START <<Remove this after dev>>
  if (process.env.NODE_ENV !== 'production' && DEBUG_SCM_TOKENS[provider.toUpperCase()]) {
    data = { ...data, ...{ scmToken: DEBUG_SCM_TOKENS[provider.toUpperCase()] } }
  }
  // END <<Remove this after dev>>
  console.log('debug scm data', data)

  if (!data) return <LoopingLogo dark />

  if (!data.scmToken) {
    navigate('/shell')
  }

  return (
    <CreateShell
      accessToken={data.scmToken}
      provider={provider.toUpperCase()}
      onCreate={() => navigate('/shell')}
    />
  )
}

function DemoStepper({ stepIndex = 0, ...props }) {
  const steps = [
    { stepTitle: 'Create a repository', IconComponent: GitHubIcon, iconSize: 30 },
    { stepTitle: <>Choose a&nbsp;cloud</>, IconComponent: CloudIcon },
    { stepTitle: 'Configure repository', IconComponent: GearTrainIcon },
    { stepTitle: <>Launch the&nbsp;app</>, IconComponent: BrowserIcon },
  ]

  return (
    <Stepper
      stepIndex={stepIndex}
      steps={steps}
      {...props}
    />
  )
}

function CardButton(props) {
  return (
    <Button
      flex="1 1 100%"
      p={1.5}
      display="flex"
      alignContent="center"
      justify="center"
      backgroundColor="fill-two"
      border="1px solid border-fill-two"
      _hover={{ background: 'fill-two-hover' }}
      _active={{ background: 'fill-two-selected' }}
      mx={1}
      {...props}
    />
  )
}

function DemoCard({ children, title = '' }) {
  return (
    <Div
      backgroundColor="fill-one"
      border="1px solid border"
      borderRadius="large"
      p={2}
      pt={1}
    >
      {title && (
        <H2
          overline
          color="text-xlight"
          mb={0.5}
          width="100%"
        >
          {title}
        </H2>
      )}
      {children}
    </Div>
  )
}

function CreateARepoCard1({ data }) {
  const urls = data?.scmAuthorization
  console.log('data.scma', urls)

  return (
    <DemoCard title="Create a repository">
      <P
        body1
        color="text-light"
        mb={1}
      >
        We use GitOps to manage your application’s state. Use one of the following providers to get started.
      </P>
      <Flex mx={-1}>
        {urls?.map(({ provider, url }) => {
          let providerLogo = null
          let providerName = provider.toLowerCase
          switch (provider.toLowerCase()) {
            case 'github':
              providerName = 'GitHub'
              providerLogo = <GithubLogo />
              break
            case 'gitlab':
              providerName = 'Gitlab'
              providerLogo = <GitlabLogo />
              break
          }

          return (
            <CardButton
              onClick={() => {
                // START <<Remove this after dev>>
                if (process.env.NODE_ENV !== 'production' && DEBUG_SCM_TOKENS[provider]) {
                  console.log('going to ', `/oauth/callback/${provider.toLowerCase()}/shell?code=abcd`)
                  window.location = `/oauth/callback/${provider.toLowerCase()}/shell?code=abcd`

                  return
                }
                // END <<Remove this after dev>>

                window.location = url
              }}
            >
              <Div
                mx="auto"
                maxWidth={40}
                maxHeight={40}
              >
                { providerLogo }
              </Div>
              <Text
                body1
                mt={1}
              >
                Create a { providerName } repo
              </Text>
            </CardButton>
          )
        })}
      </Flex>
    </DemoCard>
  )
}

export function DemoWrapper({ showSplashScreen = false, stepIndex = 0, childIsReady = true, children }) {
  return (
    <Flex
      width="100%"
      alignItems="center"
      flexDirection="column"
      mt={3}
    >
      <SplashToLogoTransition
        showSplashScreen={showSplashScreen}
        splashTimeout={1200}
        childIsReady={childIsReady}
      >
        {childIsReady && (
          <Div
            position="relative"
            zIndex="0"
            width="100%"
            maxWidth={640}
            mt={2}
            px={2}
          >
            <Div mb={3}>
              <DemoStepper stepIndex={stepIndex} />
            </Div>
            {children}
          </Div>
        )}
      </SplashToLogoTransition>
    </Flex>
  )
}

export function CloudShell() {
  const { data } = useQuery(AUTH_URLS)
  const { data: shellData } = useQuery(CLOUD_SHELL, { fetchPolicy: 'cache-and-network' })
  const [mutation] = useMutation(REBOOT_SHELL)
  const [created, setCreated] = useState(false)

  useEffect(() => {
    if (shellData && shellData.shell && !shellData.shell.alive) {
      mutation()
      setCreated(true)
    }
  }, [shellData, setCreated, mutation])

  const ready = useMemo(
    () => (shellData && data),
    [shellData, data]
  )
  if ((shellData && shellData.shell) || created) return <Terminal />

  return (
    <DemoWrapper
      showSplashScreen
      stepIndex={0}
      childIsReady={ready}
    >
      <CreateARepoCard1 data={data} />
    </DemoWrapper>
  )
}

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { Box } from 'grommet'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { Alert, BrowserIcon, CloudIcon, GearTrainIcon, NetworkInterfaceIcon, StatusIpIcon, Stepper } from 'pluralsh-design-system'
import { Button, Div, Flex, H2, P, Text } from 'honorable'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { AUTH_URLS, CLOUD_SHELL, CREATE_SHELL, REBOOT_SHELL, SCM_TOKEN } from './query'
import { GITHUB_VALIDATIONS } from './scm/github'
import { WORKSPACE_VALIDATIONS, WorkspaceForm } from './WorkspaceForm'
import { Terminal } from './Terminal'
import { getExceptions } from './validation'
import { CLOUD_VALIDATIONS, ProviderForm, synopsis } from './cloud/provider'
import { SCM_VALIDATIONS, ScmSection } from './scm/ScmInput'
import { Github as GithubLogo, Gitlab as GitlabLogo } from './icons'
import InstallCli from './cloud/InstallCli'

import SplashToLogoTransition from './SplashToLogoTransition'
import { SECTIONS, SECTION_CLOUD, SECTION_FINISH, SECTION_GIT, SECTION_INSTALL_CLI, SECTION_WORKSPACE } from './constants'

// START <<Remove this after dev>>
const DEBUG_SCM_TOKENS = {
  GITLAB: '',
  GITHUB: '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',
}
const VALIDATIONS = {
  [SECTION_GIT]: GITHUB_VALIDATIONS,
  [SECTION_WORKSPACE]: WORKSPACE_VALIDATIONS,
}

export const CreateShellContext = createContext()

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

export function NavSection(props) {
  return (
    <Flex
      marginTop="xxlarge"
      justify="space-between"
      {...props}
    />
  )
}

function getValidations(provider, scmProvider, section) {
  if (section === SECTION_CLOUD) return CLOUD_VALIDATIONS[provider]
  if (section === SECTION_GIT) return SCM_VALIDATIONS[scmProvider]

  return VALIDATIONS[section]
}

function CreateShell({ accessToken, onCreate, provider: scmProvider, authUrlData }) {
  const [demo, setDemo] = useState(null)
  const [section, setSection] = useState(SECTION_GIT)
  const [providerName, setProvider] = useState('AWS')
  const [scm, setScm] = useState({ name: '', provider: scmProvider, token: accessToken })
  const [credentials, setCredentials] = useState({})
  const [workspace, setWorkspace] = useState({})
  const [mutation, { loading, error: gqlError }] = useMutation(CREATE_SHELL, {
    variables: { attributes: { credentials, workspace, scm, provider: providerName, demoId: demo && demo.id } },
    onCompleted: onCreate,
  })

  const doSetProvider = useCallback(provider => {
    setProvider(provider)
    setCredentials({})
    setWorkspace({ ...workspace, region: null })
  }, [setProvider, setCredentials, setWorkspace, workspace])

  const next = useCallback(() => {
    const hasNext = !!SECTIONS[section].next
    if (hasNext) setSection(SECTIONS[section].next)
    if (!hasNext) mutation()
  }, [section, mutation])

  const previous = useCallback(() => {
    const hasPrevious = !!SECTIONS[section].previous
    if (hasPrevious) setSection(SECTIONS[section].previous)
    if (!hasPrevious) mutation()
  }, [section, mutation])

  const validations = getValidations(providerName, scmProvider, section)
  const { error, exceptions } = getExceptions(validations, { credentials, workspace, scm })

  const { stepIndex } = SECTIONS[section]

  const contextData = useMemo(() => ({
    scmProvider,
    accessToken,
    scm,
    setScm,
    setProvider: doSetProvider,
    authUrlData,
    provider: providerName,
    workspace,
    setWorkspace,
    credentials,
    setCredentials,
    demo,
    setDemo,
    next,
    previous,
    setSection,
    error,
    exceptions,
  }), [
    scmProvider,
    accessToken,
    scm,
    setScm,
    doSetProvider,
    authUrlData,
    providerName,
    workspace,
    setWorkspace,
    credentials,
    setCredentials,
    demo,
    setDemo,
    next,
    previous,
    setSection,
    error,
    exceptions,
  ])

  return (
    <CreateShellContext.Provider value={contextData}>
      <OnboardingWrapper
        stepIndex={stepIndex}
        cliMode={section === SECTION_INSTALL_CLI}
      >
        {section === SECTION_GIT && (
          <ScmSection />
        )}
        {section === SECTION_CLOUD && (
          <ProviderForm />
        )}
        {section === SECTION_INSTALL_CLI && (
          <InstallCli />
        )}
        {section === SECTION_WORKSPACE && (
          <>
            <Header text="Workspace" />
            <WorkspaceForm
              demo={demo}
              workspace={workspace}
              setWorkspace={setWorkspace}
            />
          </>
        )}
        {section === SECTION_FINISH && (
          <Synopsis
            provider={providerName}
            workspace={workspace}
            credentials={credentials}
            demo={demo}
            scm={scm}
          />
        )}
        {/* Unhandled Errors */}
        <Div
          flex={false}
          marginTop="large"
          width="100%"
        >
          {gqlError && (
            <Alert
              severity="error"
              title="Failed to create shell"
            >
              {gqlError.graphQLErrors[0].message}
            </Alert>
          )}
        </Div>
      </OnboardingWrapper>
    </CreateShellContext.Provider>
  )
}

export function OAuthCallback({ provider }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { data: authUrlData } = useQuery(AUTH_URLS)

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

  if (!data) {
    return (
      <LoopingLogo dark />
    )
  }

  if (!data.scmToken) {
    navigate('/shell')

    return null
  }

  return (
    <CreateShell
      accessToken={data.scmToken}
      provider={provider.toUpperCase()}
      onCreate={() => navigate('/shell')}
      authUrlData={authUrlData}
    />
  )
}

function DemoStepper({ stepIndex = 0, ...props }) {
  const steps = [
    { key: SECTION_GIT, stepTitle: 'Create a repository', IconComponent: NetworkInterfaceIcon },
    { key: SECTION_CLOUD, stepTitle: <>Choose a&nbsp;cloud</>, IconComponent: CloudIcon },
    { key: SECTION_WORKSPACE, stepTitle: 'Configure repository', IconComponent: GearTrainIcon },
    { key: SECTION_FINISH, stepTitle: <>Launch the&nbsp;app</>, IconComponent: BrowserIcon },
  ]

  return (
    <Stepper
      stepIndex={stepIndex}
      steps={steps}
      {...props}
    />
  )
}

function CliStepper({ stepIndex = 0, ...props }) {
  const steps = [
    { key: SECTION_GIT, stepTitle: 'Create a repository', IconComponent: NetworkInterfaceIcon },
    { key: SECTION_INSTALL_CLI, stepTitle: <>Install CLI</>, IconComponent: CloudIcon },
    { key: SECTION_FINISH, stepTitle: <>Launch the&nbsp;app</>, IconComponent: BrowserIcon },
  ]

  return (
    <Stepper
      stepIndex={stepIndex}
      steps={steps}
      {...props}
    />
  )
}

export function CardButton({ selected = false, children, ...props }) {
  const checkMark = (
    <Div
      position="absolute"
      top={0}
      left={0}
      padding="medium"
    >
      <StatusIpIcon
        size={24}
        color="action-link-inline"
        transform={selected ? 'scale(1)' : 'scale(0)'}
        opacity={selected ? 1 : 0}
        transition="all 0.2s cubic-bezier(.37,1.4,.62,1)"
      />
    </Div>
  )

  return (
    <Button
      display="flex"
      position="relative"
      flex="1 1 100%"
      padding="large"
      marginHorizontal="medium"
      alignContent="center"
      justify="center"
      backgroundColor="fill-two"
      border="1px solid border-fill-two"
      borderColor={selected ? 'action-link-inline' : 'border-fill-two'}
      _hover={{ backgroundColor: 'fill-two-hover' }}
      _active={{ backgroundColor: 'fill-two-selected' }}
      {...props}
    >
      {children}
      {checkMark}
    </Button>
  )
}

export function OnboardingCard({ children, title = '' }) {
  return (
    <Div
      width="100%"
      backgroundColor="fill-one"
      border="1px solid border"
      borderRadius="large"
      padding="xlarge"
      paddingTop="medium"
    >
      {!!title && (
        <H2
          overline
          color="text-xlight"
          marginBottom="xsmall"
          width="100%"
        >
          {title}
        </H2>
      )}
      {children}
    </Div>
  )
}

const providerToLogo = {
  github: <GithubLogo />,
  gitlab: <GitlabLogo />,
}

const providerToDisplayName = {
  github: 'GitHub',
  gitlab: 'GitLab',
}

function CreateRepositoryCard({ data }) {
  return (
    <OnboardingCard title="Create a repository">
      <P
        body1
        color="text-light"
        marginBottom="medium"
      >
        We use GitOps to manage your application's state. Use one of the following providers to get started.
      </P>
      <Flex mx={-1}>
        {data?.scmAuthorization?.map(({ provider, url }) => (
          <CardButton
            key={provider}
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
              marginHorizontal="auto"
              maxWidth={40}
              maxHeight={40}
            >
              {providerToLogo[provider.toLowerCase()] || null}
            </Div>
            <Text
              body1
              bold
              marginTop="medium"
            >
              Create a {providerToDisplayName[provider.toLowerCase()] || null} repo
            </Text>
          </CardButton>
        ))}
      </Flex>
    </OnboardingCard>
  )
}

export function OnboardingWrapper({ showSplashScreen = false, stepIndex = 0, childIsReady = true, children, cliMode = false }) {
  return (
    <Flex
      width="100%"
      direction="column"
      alignItems="center"
      marginTop="xxlarge"
    >
      <SplashToLogoTransition
        showSplashScreen={showSplashScreen}
        splashTimeout={1200}
        childIsReady={childIsReady}
      >
        {childIsReady && (
          <Div
            position="relative"
            width="100%"
            maxWidth={640}
            zIndex={0}
            marginTop="xlarge"
            paddingHorizontal="xlarge"
          >
            <Div
              marginBottom="xxlarge"
            >
              {(
                cliMode
                  ? <CliStepper stepIndex={stepIndex} />
                  : <DemoStepper stepIndex={stepIndex} />
              )}
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
  const [rebootMutation] = useMutation(REBOOT_SHELL)
  const [created, setCreated] = useState(false)

  useEffect(() => {
    if (shellData && shellData.shell && !shellData.shell.alive) {
      rebootMutation()
      setCreated(true)
    }
  }, [shellData, rebootMutation])

  const ready = useMemo(
    () => (shellData && data),
    [shellData, data]
  )

  if ((shellData && shellData.shell) || created) {
    return (
      <Terminal />
    )
  }

  return (
    <OnboardingWrapper
      showSplashScreen
      stepIndex={0}
      childIsReady={ready}
    >
      <CreateRepositoryCard data={data} />
    </OnboardingWrapper>
  )
}

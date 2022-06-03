import { createElement, useCallback, useEffect, useMemo, useState } from 'react'
import { Box } from 'grommet'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { BrowserIcon, CloudIcon, GearTrainIcon, GitHubIcon, StatusIpIcon, Stepper } from 'pluralsh-design-system'
import { Button, Div, Flex, H1, P, Text } from 'honorable'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { GqlError } from '../utils/Alert'

import { METHOD_ICONS } from '../users/OauthEnabler'

import { AUTH_URLS, CLOUD_SHELL, CREATE_SHELL, REBOOT_SHELL, SCM_TOKEN } from './query'
import { GITHUB_VALIDATIONS } from './scm/github'
import { WORKSPACE_VALIDATIONS, WorkspaceForm } from './WorkspaceForm'
import { Terminal } from './Terminal'
import { Exceptions, getExceptions } from './validation'
import { CLOUD_VALIDATIONS, ProviderForm, synopsis } from './cloud/provider'
import { SCM_VALIDATIONS, ScmInput } from './scm/ScmInput'

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

function SecondaryButton({ label, onClick }) {
  return (
    <Button
      background="sidebarHover"
      label={label}
      onClick={onClick}
    />
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
  const [provider, setProvider] = useState('AWS')
  const [scm, setScm] = useState({ name: '', provider: scmProvider, token: accessToken })
  const [credentials, setCredentials] = useState({})
  const [workspace, setWorkspace] = useState({})
  const [mutation, { loading, error: gqlError }] = useMutation(CREATE_SHELL, {
    variables: { attributes: { credentials, workspace, scm, provider, demoId: demo && demo.id } },
    onCompleted: onCreate,
  })

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

  const validations = getValidations(provider, scmProvider, section)
  const { error, exceptions } = getExceptions(validations, { credentials, workspace, scm })

  return (
    <Box
      style={{ overflow: 'auto', height: '100%', width: '100%' }}
      background="background"
      align="center"
      justify="center"
      pad="small"
    >
      <Box
        flex={false}
        gap="small"
        width={section !== 'finish' ? '50%' : null}
      >
        {exceptions && (!demo || section !== 'cloud') && <Exceptions exceptions={exceptions} />}
        {gqlError && (
          <GqlError
            error={gqlError}
            header="Failed to create shell"
          />
        )}
        {section === 'git' && (
          <>
            <Header text="Git Setup" />
            <ScmInput
              provider={scmProvider}
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
            provider={provider}
            workspace={workspace}
            credentials={credentials}
            demo={demo}
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

export function OAuthCallback({ provider }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { data } = useQuery(SCM_TOKEN, {
    variables: {
      code: searchParams.get('code'),
      provider: provider.toUpperCase(),
    },
  })

  if (!data) return <LoopingLogo dark />

  console.log(data)

  return (
    <Box
      background="background"
      fill
      align="center"
      justify="center"
    >
      <CreateShell
        accessToken={data.scmToken}
        provider={provider.toUpperCase()}
        onCreate={() => navigate('/shell')}
      />
    </Box>
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
      justifyItems="center"
      backgroundColor="fill-two"
      border="1px solid border-fill-two"
      _hover={{ background: 'fill-two-hover' }}
      mx={1}
      {...props}
    />
  )
}

export function CloudShell({ oAuthCallback }) {
  const { data } = useQuery(AUTH_URLS)
  const { data: shellData } = useQuery(CLOUD_SHELL, { fetchPolicy: 'cache-and-network' })
  const [mutation] = useMutation(REBOOT_SHELL)
  const [created, setCreated] = useState(false)
  const [splashTimerDone, setSplashTimerDone] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const splashWaitTime = 100

  useEffect(() => {
    setTimeout(() => {
      setSplashTimerDone(true)
    }, splashWaitTime)
  }, [])

  useEffect(() => {
    if (shellData && shellData.shell && !shellData.shell.alive) {
      mutation()
      setCreated(true)
    }
  }, [shellData, setCreated, mutation])

  const showSplashScreen = useMemo(
    () => (!shellData || !data || !splashTimerDone),
    [shellData, data, splashTimerDone]
  )
  const urls = data?.scmAuthorization
  if ((shellData && shellData.shell) || created) return <Terminal />

  return (
    <Flex
      width="100%"
      alignItems="center"
      flexDirection="column"
    >
      <Div width="30px">
        <LoopingLogo
          light
          still={!showSplashScreen}
          height="12px"
          scale="0.2"
        />
      </Div>
      {
        !showSplashScreen && (
          <Div
            width="100%"
            maxWidth="600px"
          >
            <Div mb={3}>
              <DemoStepper stepIndex={stepIndex} />
            </Div>
            <Div
              backgroundColor="fill-one"
              border="1px solid border"
              borderRadius="normal"
              p={2}
              pt={1}
            >
              <H1
                body2
                lineHeight="24px"
                fontWeight={400}
                textTransform="uppercase"
                letterSpacing="1px"
                color="text-x-light"
                mb={0.5}
              >
                Create a repository
              </H1>
              <P mb={1}>
                We use GitOps to manage your application’s state. Use one of the following providers to get started.
              </P>
              <Flex mx={-1}>
                {urls.map(({ provider, url }) => (
                  <CardButton
                    onClick={() => {
                  // START <<Remove this after dev>>
                      const devTokens = {
                    // GITLAB: '',
                        GITHUB: 'b11776d43c92ddeec643',
                      }
                      console.log('process.env.NODE_ENV', process.env.NODE_ENV)
                      console.log('devTokens[provider]', devTokens[provider])
                      console.log('[provider]', provider)
                      if (process.env.NODE_ENV !== 'production' && devTokens[provider]) {
                        console.log('going to ', `/oauth/callback/${provider.toLowerCase()}/shell?code=${devTokens[provider]}`)
                        window.location = `/oauth/callback/${provider.toLowerCase()}/shell?code=${devTokens[provider]}`
                      }
                      else {
                  // END <<Remove this after dev>>
                        window.location = url
                      }
                    }}
                  >
                    {createElement(METHOD_ICONS[provider], { size: '40px' })}
                    <Text
                      body1
                    >
                      Create a {
                        provider.toLowerCase() === 'github' ? 'GitHub' :
                          provider.toLowerCase() === 'gitlab' ? 'Gitlab' :
                            provider.toLowerCase()
                      } repo
                    </Text>
                  </CardButton>
                ))}
              </Flex>
            </Div>
          </Div>
        )
      }
    </Flex>
  )
}

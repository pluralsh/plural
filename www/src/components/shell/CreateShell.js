import { useCallback, useMemo, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Alert } from 'pluralsh-design-system'
import { Div } from 'honorable'

import CreateShellContext from '../../contexts/CreateShellContext'

import { CREATE_SHELL_MUTATION } from './query'
import { GITHUB_VALIDATIONS } from './onboarding/scm/github'
import { getExceptions } from './validation'
import { CLOUD_VALIDATIONS, ProviderForm } from './onboarding/cloud/provider'
import { SCM_VALIDATIONS, ScmSection } from './onboarding/scm/ScmInput'
import { SECTIONS, SECTION_CLOUD_SELECT, SECTION_CLOUD_WORKSPACE, SECTION_COMPLETE_CLI, SECTION_GIT_PROVIDER, SECTION_INSTALL_CLI, SECTION_SYNOPSIS } from './constants'

import OnboardingWrapper from './onboarding/OnboardingWrapper'
import InstallCli from './onboarding/cloud/InstallCli'
import CompleteCLi from './onboarding/cloud/CompleteCli'
import CloudWorkspace, { CLOUD_WORKSPACE_VALIDATIONS } from './onboarding/cloud/CloudWorkspace'
import Synopsis from './onboarding/synopsis/Synopsis'

const VALIDATIONS = {
  [SECTION_GIT_PROVIDER]: GITHUB_VALIDATIONS,
  [SECTION_CLOUD_WORKSPACE]: CLOUD_WORKSPACE_VALIDATIONS,
}

function getValidations(provider, scmProvider, section) {
  if (section === SECTION_CLOUD_SELECT) return CLOUD_VALIDATIONS[provider]
  if (section === SECTION_GIT_PROVIDER) return SCM_VALIDATIONS[scmProvider]

  return VALIDATIONS[section]
}

function CreateShell({ accessToken, onCreate, provider: scmProvider, authUrlData }) {
  const [demo, setDemo] = useState(null)
  const [section, setSection] = useState(SECTION_GIT_PROVIDER)
  const [providerName, setProvider] = useState('AWS')
  const [scm, setScm] = useState({ name: '', provider: scmProvider, token: accessToken })
  const [credentials, setCredentials] = useState({})
  const [workspace, setWorkspace] = useState({})
  const [mutation, { error: gqlError }] = useMutation(CREATE_SHELL_MUTATION, {
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
        cliMode={section === SECTION_INSTALL_CLI || section === SECTION_COMPLETE_CLI}
      >
        {section === SECTION_GIT_PROVIDER && (
          <ScmSection />
        )}
        {section === SECTION_CLOUD_SELECT && (
          <ProviderForm />
        )}
        {section === SECTION_INSTALL_CLI && (
          <InstallCli />
        )}
        {section === SECTION_COMPLETE_CLI && (
          <CompleteCLi />
        )}
        {section === SECTION_CLOUD_WORKSPACE && (
          <CloudWorkspace />
        )}
        {section === SECTION_SYNOPSIS && (
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

export default CreateShell

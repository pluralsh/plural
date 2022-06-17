import { useCallback, useMemo, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Alert } from 'pluralsh-design-system'
import { Div } from 'honorable'

import CreateShellContext from '../../contexts/CreateShellContext'

import { CREATE_SHELL_MUTATION } from './query'
import { GITHUB_VALIDATIONS } from './onboarding/scm/github'
import { WORKSPACE_VALIDATIONS, WorkspaceForm } from './WorkspaceForm'
import { getExceptions } from './validation'
import { CLOUD_VALIDATIONS, ProviderForm } from './onboarding/cloud/provider'
import { SCM_VALIDATIONS, ScmSection } from './onboarding/scm/ScmInput'
import InstallCli from './onboarding/cloud/InstallCli'
import FinishCli from './onboarding/cloud/FinishCli'
import { SECTIONS, SECTION_CLOUD, SECTION_FINISH, SECTION_FINISH_CLI, SECTION_GIT, SECTION_INSTALL_CLI, SECTION_WORKSPACE } from './constants'

import OnboardingWrapper from './onboarding/OnboardingWrapper'
import Header from './onboarding/OnboardingHeader'
import Synopsis from './onboarding/synopsis/Synopsis'

const VALIDATIONS = {
  [SECTION_GIT]: GITHUB_VALIDATIONS,
  [SECTION_WORKSPACE]: WORKSPACE_VALIDATIONS,
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
        cliMode={section === SECTION_INSTALL_CLI || section === SECTION_FINISH_CLI}
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
        {section === SECTION_FINISH_CLI && (
          <FinishCli />
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

export default CreateShell

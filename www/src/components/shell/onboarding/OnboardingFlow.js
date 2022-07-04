import { useCallback, useMemo, useState } from 'react'

import { Flex } from 'honorable'

import CreateShellContext from '../../../contexts/CreateShellContext'

import { getExceptions } from '../validation'

import {
  SECTIONS,
  SECTION_CLI_COMPLETION,
  SECTION_CLI_INSTALLATION,
  SECTION_CLOUD_BUILD,
  SECTION_CLOUD_CREDENTIALS,
  SECTION_CLOUD_LAUNCH,
  SECTION_CLOUD_SELECT,
  SECTION_CLOUD_WORKSPACE,
  SECTION_GIT_PROVIDER,
  SECTION_SYNOPSIS,
} from '../constants'

import { GITHUB_VALIDATIONS } from './scm/github'
import { CLOUD_VALIDATIONS } from './cloud/provider'
import { SCM_VALIDATIONS, ScmSection } from './scm/ScmInput'

// Common
import OnboardingWrapper from './OnboardingWrapper'
// Cloud
import CloudSelect from './cloud/CloudSelect'
import CloudBuild from './cloud/CloudBuild'
import CloudCredentials from './cloud/CloudCredentials'
import CloudWorkspace, { CLOUD_WORKSPACE_VALIDATIONS } from './cloud/CloudWorkspace'
import CloudLaunch from './cloud/CloudLaunch'
// CLI
import CliInstallation from './cli/CliInstallation'
import CliCompletion from './cli/CliCompletion'
// Synopsis
import Synopsis from './synopsis/Synopsis'
import OnboardingFooter from './OnboardingFooter'

const VALIDATIONS = {
  [SECTION_GIT_PROVIDER]: GITHUB_VALIDATIONS,
  [SECTION_CLOUD_WORKSPACE]: CLOUD_WORKSPACE_VALIDATIONS,
}

function getValidations(provider, scmProvider, section) {
  if (section === SECTION_CLOUD_SELECT) return CLOUD_VALIDATIONS[provider]
  if (section === SECTION_GIT_PROVIDER) return SCM_VALIDATIONS[scmProvider]

  return VALIDATIONS[section]
}

function OnboardingFlow({ accessToken, provider: scmProvider, authUrlData }) {
  const [demoId, setDemoId] = useState(null)
  const [section, setSection] = useState(SECTION_GIT_PROVIDER)
  const [providerName, setProvider] = useState('AWS')
  const [scm, setScm] = useState({ name: '', provider: scmProvider, token: accessToken })
  const [credentials, setCredentials] = useState({})
  const [workspace, setWorkspace] = useState({})

  const doSetProvider = useCallback(provider => {
    setProvider(provider)
    setCredentials({})
    setWorkspace({ ...workspace, region: null })
  }, [setProvider, setCredentials, setWorkspace, workspace])

  const next = useCallback(() => {
    const hasNext = !!SECTIONS[section].next
    if (hasNext) setSection(SECTIONS[section].next)
  }, [section])

  const previous = useCallback(() => {
    const hasPrevious = !!SECTIONS[section].previous
    if (hasPrevious) setSection(SECTIONS[section].previous)
  }, [section])

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
    demoId,
    setDemoId,
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
    demoId,
    setDemoId,
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
        cliMode={section === SECTION_CLI_INSTALLATION || section === SECTION_CLI_COMPLETION}
      >
        {section === SECTION_GIT_PROVIDER && (
          <ScmSection />
        )}
        {section === SECTION_CLOUD_SELECT && (
          <CloudSelect />
        )}
        {section === SECTION_CLOUD_BUILD && (
          <CloudBuild />
        )}
        {section === SECTION_CLOUD_CREDENTIALS && (
          <CloudCredentials />
        )}
        {section === SECTION_CLOUD_WORKSPACE && (
          <CloudWorkspace />
        )}
        {section === SECTION_CLI_INSTALLATION && (
          <CliInstallation />
        )}
        {section === SECTION_CLI_COMPLETION && (
          <CliCompletion />
        )}
        {section === SECTION_SYNOPSIS && (
          <Synopsis />
        )}
        {section === SECTION_CLOUD_LAUNCH && (
          <CloudLaunch />
        )}
        <Flex
          direction="column"
          height="100%"
        />
        <OnboardingFooter />
      </OnboardingWrapper>
    </CreateShellContext.Provider>
  )
}

export default OnboardingFlow

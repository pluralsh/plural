import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useLocation } from 'react-router-dom'

import { AUTHENTICATION_URLS_QUERY, CLOUD_SHELL_QUERY, REBOOT_SHELL_MUTATION } from './queries'
import { Terminal } from './Terminal'

import CreateRepositoryCard from './CreateRepositoryCard'
import OnboardingWrapper from './onboarding/OnboardingWrapper'
import ApplicationsSelection from './onboarding/applications/ApplicationsSelection'

function CloudShell() {
  const [section, setSection] = useState<'applications' | 'git'>('applications')
  const [created, setCreated] = useState(false)
  const { data } = useQuery(AUTHENTICATION_URLS_QUERY)
  const { data: shellData } = useQuery(CLOUD_SHELL_QUERY, { fetchPolicy: 'network-only' })
  const [rebootMutation] = useMutation(REBOOT_SHELL_MUTATION)
  const ready = useMemo(() => shellData && data, [shellData, data])
  const location = useLocation()

  useEffect(() => {
    if (shellData && shellData.shell && !shellData.shell.alive) {
      rebootMutation()
      setCreated(true)
    }
  }, [shellData, rebootMutation])

  if (shellData?.shell?.alive || created) {
    return (
      <Terminal />
    )
  }

  return (
    <OnboardingWrapper
      showSplashScreen={!location?.state?.hideSplashScreen}
      stepIndex={section === 'applications' ? 0 : 1}
      childIsReady={ready}
      onRestart={() => setSection('applications')}
    >
      {section === 'applications' && (
        <ApplicationsSelection onNext={() => setSection('git')} />
      )}
      {section === 'git' && (
        <CreateRepositoryCard data={data} />
      )}
    </OnboardingWrapper>
  )
}

export default CloudShell

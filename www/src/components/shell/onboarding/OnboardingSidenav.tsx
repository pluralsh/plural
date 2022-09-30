import { A, Div } from 'honorable'
import {
  BrowserIcon,
  CloudIcon,
  GearTrainIcon,
  NetworkInterfaceIcon,
  PackageIcon,
  Stepper,
  TerminalIcon,
} from 'pluralsh-design-system'
import { useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import OnboardingContext from '../../../contexts/OnboardingContext'

import {
  SECTION_APPLICATIONS,
  SECTION_SYNOPSIS,
  SECTION_GIT_PROVIDER,
  SECTION_SELECT,
  SECTION_WORKSPACE,
} from '../constants'

import useStepIndex from './useStepIndex'

const stepsDemo = [
  { key: SECTION_APPLICATIONS, stepTitle: 'Choose applications', IconComponent: PackageIcon },
  { key: SECTION_GIT_PROVIDER, stepTitle: 'Create a git repository', IconComponent: NetworkInterfaceIcon },
  { key: SECTION_SELECT, stepTitle: 'Choose a cloud', IconComponent: CloudIcon },
  { key: SECTION_WORKSPACE, stepTitle: 'Configure workspace', IconComponent: GearTrainIcon },
  { key: SECTION_SYNOPSIS, stepTitle: 'Launch cloud shell', IconComponent: BrowserIcon },
]

const stepsCli = [
  { key: SECTION_APPLICATIONS, stepTitle: 'Choose applications', IconComponent: PackageIcon },
  { key: SECTION_GIT_PROVIDER, stepTitle: 'Create a git repository', IconComponent: NetworkInterfaceIcon },
  { key: SECTION_SYNOPSIS, stepTitle: 'Install Plural CLI', IconComponent: TerminalIcon },
]

function OnboardingSidenav() {
  const {
    stack,
    provider,
    setApplications,
    setProvider,
    setConsole,
    setStack,
    setTerminalOnboardingSidebar,
  } = useContext(OnboardingContext)
  const stepIndex = useStepIndex()
  const navigate = useNavigate()

  const handleRestart = useCallback(() => {
    let url = '/shell/onboarding'

    if (stack && provider) url += `?stackName=${stack.name}&stackProvider=${provider}`

    setApplications([])
    setProvider('')
    setConsole(true)
    setStack(null)
    setTerminalOnboardingSidebar(true)
    navigate(url)
  }, [
    stack,
    provider,
    setApplications,
    setProvider,
    setConsole,
    setStack,
    setTerminalOnboardingSidebar,
    navigate,
  ])

  return (
    <Div
      paddingBottom="large"
      paddingLeft="medium"
    >
      <Stepper
        vertical
        steps={false ? stepsCli : stepsDemo}
        stepIndex={stepIndex}
      />
      <A
        inline
        onClick={handleRestart}
        marginTop="xlarge"
        marginLeft={60}
      >
        Restart
      </A>
    </Div>
  )
}

export default OnboardingSidenav

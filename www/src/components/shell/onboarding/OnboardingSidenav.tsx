import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { A } from 'honorable'
import {
  BrowserIcon,
  CloudIcon,
  GearTrainIcon,
  NetworkInterfaceIcon,
  PackageIcon,
  Stepper,
  TerminalIcon,
} from 'pluralsh-design-system'
import styled from 'styled-components'

import {
  SECTION_APPLICATIONS,
  SECTION_GIT,
  SECTION_SELECT,
  SECTION_SYNOPSIS,
  SECTION_WORKSPACE,
} from '../constants'

import {
  usePersistedApplications,
  usePersistedConsole,
  usePersistedCredentials,
  usePersistedGitData,
  usePersistedProvider,
  usePersistedStack,
  usePersistedTerminalOnboardingSidebar,
  usePersistedWorkspace,
} from '../usePersistance'

import useStepIndex from './useStepIndex'

const stepsDemo = [
  { key: SECTION_APPLICATIONS, stepTitle: 'Choose applications', IconComponent: PackageIcon },
  { key: SECTION_GIT, stepTitle: 'Create a git repository', IconComponent: NetworkInterfaceIcon },
  { key: SECTION_SELECT, stepTitle: 'Choose a cloud', IconComponent: CloudIcon },
  { key: SECTION_WORKSPACE, stepTitle: 'Configure workspace', IconComponent: GearTrainIcon },
  { key: SECTION_SYNOPSIS, stepTitle: 'Launch cloud shell', IconComponent: BrowserIcon },
]

const stepsCli = [
  { key: SECTION_APPLICATIONS, stepTitle: 'Choose applications', IconComponent: PackageIcon },
  { key: SECTION_GIT, stepTitle: 'Create a git repository', IconComponent: NetworkInterfaceIcon },
  { key: SECTION_SYNOPSIS, stepTitle: 'Install Plural CLI', IconComponent: TerminalIcon },
]

const expandAtWidth = 160
const ResponsiveWidth = styled.div(({ theme }) => {
  const medMq = '@media only screen and (min-width: 1040px)'
  const desktopMq = `@media only screen and (min-width: ${theme.breakpoints.desktop}px)`
  const desktopLargeMq = `@media only screen and (min-width: ${theme.breakpoints.desktopLarge}px)`

  return {
    width: 48,
    paddingTop: 93,
    paddingBottom: theme.spacing.large,
    textAlign: 'center',
    [medMq]: {
      width: expandAtWidth,
      textAlign: 'left',
      '.restartLink': {
        marginLeft: 60,
      },
    },
    [desktopMq]: {
      marginLeft: 64,
      width: expandAtWidth,
    },
    [desktopLargeMq]: {
      width: 240,
    },
  }
})

function OnboardingSidenav() {
  const [, setApplications] = usePersistedApplications()
  const [stack, setStack] = usePersistedStack()
  const [provider, setProvider] = usePersistedProvider()
  const [, setConsole] = usePersistedConsole()
  const [, setTerminalOnboardingSidebar] = usePersistedTerminalOnboardingSidebar()
  const [, setGitData] = usePersistedGitData()
  const [, setWorkspace] = usePersistedWorkspace()
  const [, credentials] = usePersistedCredentials()

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
    setGitData({})
    setWorkspace({})
    credentials({})
    navigate(url)
  }, [
    stack,
    provider,
    setApplications,
    setProvider,
    setConsole,
    setStack,
    setTerminalOnboardingSidebar,
    setGitData,
    setWorkspace,
    credentials,
    navigate,
  ])

  return (
    <ResponsiveWidth>
      <Stepper
        vertical
        steps={false ? stepsCli : stepsDemo}
        stepIndex={stepIndex}
        collapseAtWidth={expandAtWidth - 1}
      />
      <A
        className="restartLink"
        inline
        onClick={handleRestart}
        marginTop="xlarge"
      >
        Restart
      </A>
    </ResponsiveWidth>
  )
}

export default OnboardingSidenav

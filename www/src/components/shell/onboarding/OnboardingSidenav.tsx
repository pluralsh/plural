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
  SECTION_CLOUD_SELECT,
  SECTION_CLOUD_WORKSPACE,
  SECTION_GIT_PROVIDER,
  SECTION_SYNOPSIS,
} from '../constants'

type OnboardingSidenavProps = {
  stepIndex: number
  cliMode: boolean
  onRestart: () => void
}

const steps = [
  { key: SECTION_APPLICATIONS, stepTitle: 'Choose applications', IconComponent: PackageIcon },
  { key: SECTION_GIT_PROVIDER, stepTitle: 'Create a git repository', IconComponent: NetworkInterfaceIcon },
  { key: SECTION_CLOUD_SELECT, stepTitle: <>Choose a&nbsp;cloud</>, IconComponent: CloudIcon },
  { key: SECTION_CLOUD_WORKSPACE, stepTitle: 'Configure workspace', IconComponent: GearTrainIcon },
  { key: SECTION_SYNOPSIS, stepTitle: <>Launch cloud&nbsp;shell</>, IconComponent: BrowserIcon },
]

const stepsCli = [
  { key: SECTION_APPLICATIONS, stepTitle: 'Choose applications', IconComponent: PackageIcon },
  { key: SECTION_GIT_PROVIDER, stepTitle: 'Create a git repository', IconComponent: NetworkInterfaceIcon },
  { key: SECTION_SYNOPSIS, stepTitle: 'Install Plural CLI', IconComponent: TerminalIcon },
]

const expandAtWidth = 160
const ResponsiveWidth = styled.div(({ theme }) => {
  const medMq = '@media only screen and (min-width: 1040px)'
  const desktopMq = `@media only screen and (min-width: ${theme.breakpoints.desktop}px)`
  const desktopLargeMq = `@media only screen and (min-width: ${theme.breakpoints.desktopLarge}px)`

  console.log(theme.breakpoints.desktopLarge)

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

// eslint-disable-next-line
function OnboardingSidenav({ stepIndex, cliMode, onRestart }: OnboardingSidenavProps) {
  return (
    <ResponsiveWidth>
      <Stepper
        vertical
        steps={cliMode ? stepsCli : steps}
        stepIndex={stepIndex}
        collapseAtWidth={expandAtWidth - 1}
      />
      <A
        className="restartLink"
        inline
        onClick={onRestart}
        marginTop="xlarge"
      >
        Restart
      </A>
    </ResponsiveWidth>
  )
}

export default OnboardingSidenav

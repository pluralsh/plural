import { A, Div } from 'honorable'
import {
  BrowserIcon,
  CloudIcon,
  GearTrainIcon,
  NetworkInterfaceIcon,
  PackageIcon,
  Stepper,
} from 'pluralsh-design-system'

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
}

const steps = [
  { key: SECTION_APPLICATIONS, stepTitle: 'Choose applications', IconComponent: PackageIcon },
  { key: SECTION_GIT_PROVIDER, stepTitle: 'Create a git repository', IconComponent: NetworkInterfaceIcon },
  { key: SECTION_CLOUD_SELECT, stepTitle: 'Choose a cloud', IconComponent: CloudIcon },
  { key: SECTION_CLOUD_WORKSPACE, stepTitle: 'Configure workspace', IconComponent: GearTrainIcon },
  { key: SECTION_SYNOPSIS, stepTitle: 'Launch cloud shell', IconComponent: BrowserIcon },
]

// eslint-disable-next-line
function OnboardingSidenav({ stepIndex, cliMode }: OnboardingSidenavProps) {
  function handleRestart() {

  }

  return (
    <Div
      marginTop={82}
      marginLeft="xlarge"
      marginRight="medium"
    >
      <Stepper
        vertical
        steps={steps}
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

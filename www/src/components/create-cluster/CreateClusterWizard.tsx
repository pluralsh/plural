import { CliIcon, CloudIcon, StepperSteps } from '@pluralsh/design-system'

import { HostingOptionsStep } from './steps/HostingOptionsStep'

export enum CreateClusterStepKey {
  HostingOptions = 'hosting-options',
  ConfigureCloudInstance = 'configure-cloud-instance',
  InstallCli = 'install-cli',
  Authentication = 'authentication',
  DeployLocally = 'deploy-locally',
}

type CreateClusterStep = StepperSteps[number] & {
  component: React.ReactNode
}

export const localSteps: CreateClusterStep[] = [
  {
    key: CreateClusterStepKey.HostingOptions,
    stepTitle: 'Hosting options',
    IconComponent: CloudIcon,
    component: <HostingOptionsStep />,
  },
  {
    key: CreateClusterStepKey.InstallCli,
    stepTitle: 'Install Plural CLI',
    IconComponent: CliIcon,
    component: <div>TODO</div>,
  },
  {
    key: CreateClusterStepKey.DeployLocally,
    stepTitle: 'Deploy locally',
    IconComponent: CloudIcon,
    component: <div>TODO</div>,
  },
]

export const cloudSteps: CreateClusterStep[] = [
  {
    key: CreateClusterStepKey.HostingOptions,
    stepTitle: 'Hosting options',
    IconComponent: CloudIcon,
    component: <HostingOptionsStep />,
  },
  {
    key: CreateClusterStepKey.ConfigureCloudInstance,
    stepTitle: 'Configure cloud instance',
    IconComponent: CloudIcon,
    component: <div>TODO</div>,
  },
  {
    key: CreateClusterStepKey.InstallCli,
    stepTitle: 'Install Plural CLI',
    IconComponent: CloudIcon,
    component: <div>TODO</div>,
  },
  {
    key: CreateClusterStepKey.Authentication,
    stepTitle: 'Authentication',
    IconComponent: CloudIcon,
    component: <div>TODO</div>,
  },
]

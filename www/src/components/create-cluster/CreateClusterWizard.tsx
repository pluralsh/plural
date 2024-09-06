import {
  CliIcon,
  CloudIcon,
  ListIcon,
  ShieldOutlineIcon,
  StepperSteps,
} from '@pluralsh/design-system'

import React, { ReactElement, createContext, useContext } from 'react'

import { AuthenticationStep } from './steps/AuthenticationStep'
import { ConfigureCloudInstanceStep } from './steps/ConfigureCloudInstanceStep'
import { DeployLocallyStep } from './steps/DeployLocallyStep'
import { HostingOptionsStep } from './steps/HostingOptionsStep'
import { InstallCliStep } from './steps/InstallCliStep'

export enum CreateClusterStepKey {
  HostingOptions = 'hosting-options',
  ConfigureCloudInstance = 'configure-cloud-instance',
  InstallCli = 'install-cli',
  Authentication = 'authentication',
  DeployLocally = 'deploy-locally',
}

type CreateClusterStep = Omit<StepperSteps[number], 'stepTitle' | 'key'> & {
  key: CreateClusterStepKey
  stepTitle?: string
  component: React.ReactNode
}

type HostingOption = 'local' | 'cloud'

export type CreateClusterContextType = {
  hostingOption: HostingOption
  setHostingOption: (option: HostingOption) => void
  curStep: CreateClusterStepKey
  setCurStep: (step: CreateClusterStepKey) => void
  finishEnabled: boolean
  setFinishEnabled: (enabled: boolean) => void
  continueBtn?: ReactElement
  setContinueBtn: (continueBtn?: ReactElement) => void
  consoleInstanceId: Nullable<string>
  setConsoleInstanceId: (consoleInstanceId: Nullable<string>) => void
  consoleUrl?: string
  isCreatingInstance: boolean
}

export const CreateClusterContext = createContext<
  CreateClusterContextType | undefined
>(undefined)

export const useCreateClusterContext = () => {
  const ctx = useContext(CreateClusterContext)

  if (!ctx) {
    throw new Error(
      'useCreateClusterContext must be used within a CreateClusterProvider'
    )
  }

  return ctx
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
    component: <InstallCliStep />,
  },
  {
    key: CreateClusterStepKey.DeployLocally,
    stepTitle: 'Deploy locally',
    IconComponent: ListIcon,
    component: <DeployLocallyStep />,
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
    component: <ConfigureCloudInstanceStep />,
  },
  {
    key: CreateClusterStepKey.InstallCli,
    stepTitle: 'Install Plural CLI',
    IconComponent: CliIcon,
    component: <InstallCliStep />,
  },
  {
    key: CreateClusterStepKey.Authentication,
    stepTitle: 'Authentication',
    IconComponent: ShieldOutlineIcon,
    component: <AuthenticationStep />,
  },
]

import {
  CliIcon,
  CloudIcon,
  ListIcon,
  ShieldOutlineIcon,
  StepperSteps,
} from '@pluralsh/design-system'

import React, { createContext, useContext } from 'react'

import { HostingOptionsStep } from './steps/HostingOptionsStep'
import { InstallCliStep } from './steps/InstallCliStep'
import { AuthenticationStep } from './steps/AuthenticationStep'
import { ConfigureCloudInstanceStep } from './steps/ConfigureCloudInstanceStep'
import { DeployLocallyStep } from './steps/DeployLocallyStep'

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

type CreateClusterContextType = {
  hostingOption: HostingOption
  setHostingOption: (option: HostingOption) => void
  curStep: CreateClusterStepKey
  setCurStep: (step: CreateClusterStepKey) => void
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

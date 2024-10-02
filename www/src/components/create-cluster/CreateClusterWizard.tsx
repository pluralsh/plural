import {
  CliIcon,
  CloudIcon,
  GlobeIcon,
  ListIcon,
  ShieldOutlineIcon,
  StepperSteps,
} from '@pluralsh/design-system'

import React, { ReactElement, createContext, useContext } from 'react'

import { ConsoleInstanceType } from 'generated/graphql'

import { AuthenticationStep } from './steps/AuthenticationStep'
import { ConfigureCloudInstanceStep } from './steps/ConfigureCloudInstanceStep'
import { DeployLocallyStep } from './steps/DeployLocallyStep'
import { ChooseCloudStep } from './steps/ChooseCloudStep'
import { InstallCliStep } from './steps/InstallCliStep'
import { ChooseHostingOptionStep } from './steps/ChooseHostingOptionStep'

export enum CreateClusterStepKey {
  ChooseCloud = 'choose-cloud',
  ChooseHostingOption = 'choose-hosting-option',
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

export type CloudOption = 'local' | 'cloud'

export type CreateClusterContextType = {
  cloudOption: CloudOption
  setCloudOption: (option: CloudOption) => void
  hostingOption: ConsoleInstanceType
  setHostingOption: (option: ConsoleInstanceType) => void
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
    key: CreateClusterStepKey.ChooseCloud,
    stepTitle: 'Hosting options',
    IconComponent: CloudIcon,
    component: <ChooseCloudStep />,
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
    key: CreateClusterStepKey.ChooseCloud,
    stepTitle: 'Choose cloud',
    IconComponent: CloudIcon,
    component: <ChooseCloudStep />,
  },
  {
    key: CreateClusterStepKey.ChooseHostingOption,
    stepTitle: 'Choose hosting option',
    IconComponent: GlobeIcon,
    component: <ChooseHostingOptionStep />,
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

import { createContext, useContext } from 'react'

import { ConsoleInstanceFragment } from 'generated/graphql'

export enum CreateClusterStepKey {
  Instance = 'instance',
  Build = 'build',
  OpenConsole = 'open-console',
}

export const CREATE_CLUSTER_STEPS = [
  { key: CreateClusterStepKey.Instance, label: 'Instance' },
  { key: CreateClusterStepKey.Build, label: 'Build' },
  { key: CreateClusterStepKey.OpenConsole, label: 'Open console' },
]

export function isCreateClusterStepKey(
  key: unknown
): key is CreateClusterStepKey {
  return Object.values(CreateClusterStepKey).includes(
    key as CreateClusterStepKey
  )
}

export type CloudOption = 'local' | 'cloud'

export type CreateClusterContextType = {
  curStep: CreateClusterStepKey
  setCurStep: (step: CreateClusterStepKey) => void
  cloudOption: CloudOption
  setCloudOption: (option: CloudOption) => void
  consoleInstanceId: Nullable<string>
  setConsoleInstanceId: (consoleInstanceId: Nullable<string>) => void
  consoleInstance: Nullable<ConsoleInstanceFragment>
  isProvisioned: boolean
  cancel: () => void
  finish: () => void
  startOver: () => void
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

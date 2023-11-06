import { Dispatch, SetStateAction, createContext } from 'react'

import {
  CloudProps,
  Impersonation,
  OnboardingPath,
  SCMProps,
  Section,
  Sections,
  WorkspaceProps,
} from './types'

interface ContextProps {
  scm: SCMProps
  setSCM: Dispatch<SetStateAction<SCMProps>>
  cloud: CloudProps
  setCloud: Dispatch<SetStateAction<CloudProps>>
  workspace: WorkspaceProps
  setWorkspace: Dispatch<SetStateAction<WorkspaceProps>>
  valid: boolean
  setValid: Dispatch<SetStateAction<boolean>>
  sections: Sections
  setSections: Dispatch<SetStateAction<Sections>>
  section: Section
  setSection: Dispatch<SetStateAction<Section>>
  path: OnboardingPath
  setPath: Dispatch<SetStateAction<OnboardingPath>>
}

interface SerializableContextProps {
  scm: SCMProps
  cloud: CloudProps
  workspace: WorkspaceProps
  valid: boolean
  section: Section
  sections?: Sections
  impersonation?: Impersonation
  path?: OnboardingPath
}

const toSerializableSection = (section: Section): Partial<Section> => ({
  key: section.key,
  index: section.index,
  title: section.title,
  state: section.state,
})

const toSerializableContext = (
  context: ContextProps,
  impersonation?: Impersonation
): SerializableContextProps => ({
  valid: context.valid,
  scm: context.scm,
  workspace: context.workspace,
  cloud: {
    type: context?.cloud?.type,
    provider: context?.cloud?.provider,
  },
  section: toSerializableSection(context.section) as Section,
  impersonation,
  path: context?.path,
})

const OnboardingContext = createContext<ContextProps>({} as ContextProps)

export type { ContextProps, SerializableContextProps }
export { OnboardingContext, toSerializableContext }

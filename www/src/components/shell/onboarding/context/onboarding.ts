import { Dispatch, SetStateAction, createContext } from 'react'

import {
  CloudProps,
  SCMProps,
  Section,
  SectionKey,
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
}

interface SerializableContextProps {
  scm: SCMProps
  cloud: CloudProps
  workspace: WorkspaceProps
  valid: boolean
  section: Section
  sections?: Sections
}

const toSerializableSection = (section: Section): Partial<Section> => ({
  key: section.key,
  index: section.index,
  title: section.title,
  state: section.state,
})

const toSerializableContext = (context: ContextProps): SerializableContextProps => ({
  valid: context.valid,
  scm: context.scm,
  workspace: context.workspace,
  cloud: {
    type: context?.cloud?.type,
    provider: context?.cloud?.provider,
  },
  section: toSerializableSection(context.section) as Section,

})

const OnboardingContext = createContext<ContextProps>({} as ContextProps)

export type { ContextProps, SerializableContextProps }
export { OnboardingContext, toSerializableContext }

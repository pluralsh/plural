import { Dispatch, SetStateAction, createContext } from 'react'

import {
  CloudProps,
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
}

const OnboardingContext = createContext<ContextProps>({} as ContextProps)

export type { ContextProps }
export { OnboardingContext }

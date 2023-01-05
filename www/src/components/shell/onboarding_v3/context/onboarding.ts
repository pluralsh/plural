import { Dispatch, createContext } from 'react'

import {
  CloudProps,
  SCMProps,
  Section,
  Sections,
  WorkspaceProps,
} from './types'

interface ContextProps {
  scm: SCMProps
  setSCM: Dispatch<SCMProps>
  cloud: CloudProps
  setCloud: Dispatch<CloudProps>
  workspace: WorkspaceProps
  setWorkspace: Dispatch<WorkspaceProps>
  valid: boolean
  setValid: Dispatch<boolean>
  sections: Sections
  setSections: Dispatch<Sections>
  section: Section
  setSection: Dispatch<Section>
}

const OnboardingContext = createContext<ContextProps>({} as ContextProps)

export type { ContextProps }
export { OnboardingContext }

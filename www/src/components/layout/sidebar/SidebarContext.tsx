import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useMemo,
} from 'react'

import usePersistedState from '../../../hooks/usePersistedState'

export const SIDEBAR_WIDTH = 64
export const SIDEBAR_EXPANDED_WIDTH = 220

type SidebarContextT = {
  isExpanded: boolean
  setIsExpanded: Dispatch<SetStateAction<boolean>>
}

export const SidebarContext = createContext<SidebarContextT>({
  isExpanded: true,
  setIsExpanded: () => {},
})

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = usePersistedState<boolean>(
    'sidebar-expanded',
    true
  )
  const ctx = useMemo(
    () => ({ isExpanded, setIsExpanded }),
    [isExpanded, setIsExpanded]
  )

  return <SidebarContext value={ctx}>{children}</SidebarContext>
}

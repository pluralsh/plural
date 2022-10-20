import { Dispatch, SetStateAction, createContext } from 'react'

export type OnboardingChecklistContextType = {
  dismissed: boolean,
  setDismissed: Dispatch<SetStateAction<boolean>>
}

export const OnboardingChecklistContext = createContext<OnboardingChecklistContextType>({ dismissed: false, setDismissed: () => {} })

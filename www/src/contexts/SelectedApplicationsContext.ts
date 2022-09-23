import { Dispatch, SetStateAction, createContext } from 'react'

export type SelectedApplicationsContextType = {
  selectedApplications: any[]
  setSelectedApplications: Dispatch<SetStateAction<any[]>>
}

export default createContext<SelectedApplicationsContextType>({
  selectedApplications: [],
  setSelectedApplications: () => {},
})

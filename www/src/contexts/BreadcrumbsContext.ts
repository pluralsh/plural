import { Dispatch, SetStateAction, createContext } from 'react'

export type BreadcrumbsContextType = {
  breadcrumbs: any[]
  setBreadcrumbs: Dispatch<SetStateAction<any[]>>
}

const BreadcrumbsContext = createContext<BreadcrumbsContextType>({
  breadcrumbs: [],
  setBreadcrumbs: () => null,
})

export default BreadcrumbsContext

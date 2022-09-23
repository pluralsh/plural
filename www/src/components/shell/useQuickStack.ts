import { useMutation } from '@apollo/client'
import { useEffect } from 'react'

import { PROVIDER_LOCAL_STORAGE_KEY, SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY } from './constants'
import { CREATE_QUICK_STACK_MUTATION } from './queries'

function useQuickStack(isDemo: boolean) {
  const provider = isDemo ? 'GCP' : localStorage.getItem(PROVIDER_LOCAL_STORAGE_KEY)
  let selectedApplications: any[] = [] // eslint-disable-line

  try {
    selectedApplications = JSON.parse(localStorage.getItem(SELECTED_APPLICATIONS_LOCAL_STORAGE_KEY) as string)
  }
  catch (error) {
    //
  }

  const [mutation, { data, error, loading }] = useMutation(CREATE_QUICK_STACK_MUTATION, {
    variables: {
      provider,
      applicationIds: selectedApplications.map(application => application.id),
    },
  })

  useEffect(() => {
    if (!provider) return
    if (!selectedApplications.length) return

    mutation()
  }, [provider, selectedApplications, isDemo, mutation])

  return loading || error ? null : data?.quickStack?.name ?? null
}

export default useQuickStack

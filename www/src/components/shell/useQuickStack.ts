import { useMutation } from '@apollo/client'
import { useEffect, useMemo } from 'react'

import { CREATE_QUICK_STACK_MUTATION } from './queries'
import { retrieveApplications, retrieveProvider } from './persistance'

function useQuickStack() {
  const provider = useMemo(() => retrieveProvider(), [])
  const applications = useMemo(() => retrieveApplications(), [])

  const [mutation, { data, error, loading }] = useMutation(CREATE_QUICK_STACK_MUTATION, {
    variables: {
      provider,
      applicationIds: applications.map(application => application.id),
    },
  })

  useEffect(() => {
    console.log('provider, selectedApplications', provider, applications)
    if (!provider) return
    if (!applications.length) return

    mutation()
  }, [provider, applications, mutation])

  console.log('data', data)

  return loading || error ? null : data?.quickStack?.name ?? null
}

export default useQuickStack

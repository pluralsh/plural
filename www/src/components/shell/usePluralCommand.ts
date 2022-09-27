import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useMemo } from 'react'

import { CREATE_QUICK_STACK_MUTATION } from './queries'
import { retrieveApplications, retrieveProvider, retrieveStack } from './persistance'

function usePluralCommand() {
  const provider = useMemo(() => retrieveProvider(), [])
  const applications = useMemo(() => retrieveApplications(), [])
  const stack = useMemo(() => retrieveStack(), [])

  const [mutation, { data, error, loading }] = useMutation(CREATE_QUICK_STACK_MUTATION, {
    variables: {
      provider,
      applicationIds: applications.map(application => application.id),
    },
  })

  const isStackComplete = useCallback(() => {
    if (!stack) return false

    const stackApplicationIds = stack.collections.find(x => x.provider === provider).bundles.map(x => x.recipe.repository.id)
    const applicationIds = applications.map(x => x.id)

    return stackApplicationIds.length === applicationIds.length && stackApplicationIds.every(id => applicationIds.includes(id))
  }, [applications, stack, provider])

  const getApplicationCommand = useCallback(() => {
    const [application] = applications
    const recipe = application.recipes.find(x => x.provider === provider)

    if (!recipe) return 'plural bundle install airbyte airbye-gcp'

    return `plural bundle install ${application.name} ${recipe.name}`
  }, [applications, provider])

  const getStackCommand = useCallback(() => {
    if (!stack) return 'An error occured'

    return `plural stack install ${stack.name}`
  }, [stack])

  const getQuickStackCommand = useCallback(() => {
    if (error || loading) return 'plural stack install ...'
    if (data?.quickStack?.name) return `plural stack install ${data.quickStack.name}`

    return `An error occured, but you can still try "${getStackCommand()}"`
  }, [error, loading, data, getStackCommand])

  useEffect(() => {
    console.log('provider, selectedApplications', provider, applications)
    if (!provider) return
    if (!applications.length) return

    mutation()
  }, [provider, applications, mutation])

  if (applications.length === 1) return { type: 'application', command: getApplicationCommand() }
  if (isStackComplete()) return { type: 'stack', command: getStackCommand() }
  if (applications.length > 0 && !isStackComplete()) return { type: 'stack', command: getQuickStackCommand() }

  return { type: 'application', command: 'plural bundle install airbyte airbye-gcp' }
}

export default usePluralCommand

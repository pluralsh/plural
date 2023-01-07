import { useContext, useEffect, useState } from 'react'

import { CloudProvider } from '../../../context/types'

import { OnboardingContext } from '../../../context/onboarding'

import AWS from './AWS'
import Azure from './Azure'
import GCP from './GCP'

interface ProviderProps {
  provider: CloudProvider
}

function Provider({ provider }: ProviderProps) {
  const { setCloud, setWorkspace } = useContext(OnboardingContext)
  const [lastProvider, setLastProvider] = useState(provider)

  useEffect(() => {
    if (lastProvider === provider) return
    setLastProvider(provider)

    setCloud(c => {
      delete c[lastProvider]

      return c
    })
    setWorkspace({})
  }, [lastProvider, provider, setCloud, setWorkspace])

  switch (provider) {
  case CloudProvider.AWS:
    return <AWS />
  case CloudProvider.Azure:
    return <Azure />
  case CloudProvider.GCP:
    return <GCP />
  }
}

export default Provider

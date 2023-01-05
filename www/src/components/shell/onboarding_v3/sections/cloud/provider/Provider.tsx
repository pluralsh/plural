import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { usePrevious } from '@pluralsh/design-system'

import { CloudProvider } from '../../../context/types'

import { OnboardingContext } from '../../../context/onboarding'

import AWS from './AWS'
import Azure from './Azure'
import GCP from './GCP'

interface ProviderProps {
  provider: CloudProvider
}

function Provider({ provider }: ProviderProps) {
  const { cloud, setCloud, setWorkspace } = useContext(OnboardingContext)
  const [lastProvider, setLastProvider] = useState(provider)

  useEffect(() => {
    if (lastProvider === provider) return
    setLastProvider(provider)

    delete cloud[lastProvider]
    setCloud(cloud)
    setWorkspace({})
  }, [lastProvider, provider])

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

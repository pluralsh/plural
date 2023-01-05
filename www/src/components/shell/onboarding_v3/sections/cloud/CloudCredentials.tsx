import { FormField, ListBoxItem, Select } from '@pluralsh/design-system'
import { useContext, useEffect, useState } from 'react'

import { growthbook } from '../../../../../helpers/growthbook'
import { CloudProvider, CloudProviderDisplayName, CloudProviderDisplayNameType } from '../../context/types'

import { OnboardingContext } from '../../context/onboarding'

import Provider from './provider/Provider'

const CLOUDS = Object.values(CloudProvider)
const GROWTHBOOK_AZURE_CLOUD_KEY = 'azure-cloud-shell'

interface ProviderItem {
  key: string,
  label: CloudProviderDisplayNameType
}

function CloudCredentials() {
  const { cloud, setCloud } = useContext(OnboardingContext)
  const [provider, setProvider] = useState<CloudProvider>(cloud?.provider || CloudProvider.AWS)
  const providers = (growthbook.isOn(GROWTHBOOK_AZURE_CLOUD_KEY) ? CLOUDS : CLOUDS.filter(c => c !== CloudProvider.Azure))
    .map<ProviderItem>(c => ({
      key: c,
      label: CloudProviderDisplayName[c],
    }))

  useEffect(() => setCloud({ ...cloud, provider }), [provider, setCloud])

  return (
    <>
      <FormField label="Cloud provider">
        <Select
          defaultOpen={false}
          selectedKey={provider}
          onSelectionChange={key => setProvider(key)}
        >
          {providers.map(provider => (
            <ListBoxItem
              key={provider.key}
              label={provider.label}
              textValue={provider.label}
            />
          ))}
        </Select>
      </FormField>
      {provider && <Provider provider={provider} />}
    </>
  )
}

export default CloudCredentials

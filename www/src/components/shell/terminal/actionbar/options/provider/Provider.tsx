import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FormField, ListBoxItem, Select } from '@pluralsh/design-system'
import { A, Span } from 'honorable'
import { useQuery } from '@apollo/client'

import { CloudProps, CloudProvider, CloudProviderDisplayName } from '../../../../onboarding/context/types'
import { CLOUD_SHELL_QUERY } from '../../../../queries'

import AWS from './AWS'
import Azure from './Azure'
import GCP from './GCP'

interface ProviderProps {
  setProps: SetStateAction<Dispatch<CloudProps>>
}

function Provider({ setProps }: ProviderProps) {
  const [provider, setProvider] = useState<CloudProvider>()

  const providerDisplayName = useMemo(() => (provider ? CloudProviderDisplayName[provider] : ''), [provider])
  const providerElement = useMemo(() => {
    switch (provider) {
    case CloudProvider.AWS:
      return <AWS setProps={setProps} />
    case CloudProvider.Azure:
      return <Azure />
    case CloudProvider.GCP:
      return <GCP />
    }
  }, [provider, setProps])

  const { data: { shell } } = useQuery(CLOUD_SHELL_QUERY)

  useEffect(() => {
    if (!shell) return

    const provider = shell.provider?.toLowerCase()

    setProvider(provider)
    setProps(props => ({ ...props, provider, [provider]: {} }))
  }, [setProps, shell])

  console.log(provider)
  console.log(shell)

  return (
    <>
      <FormField
        label="Cloud provider"
        hint={(
          <Span
            caption
            color="text-xlight"
          >
            If you want to change your cloud provider you must destroy your cluster or set up a new cluster on another user or&nbsp;
            <A
              inline
              href=""
              target="_blank"
            >service account
            </A>.
          </Span>
        )}
      >
        <Select
          defaultOpen={false}
          selectedKey={provider}
          isDisabled
        >
          <ListBoxItem
            key={provider}
            label={providerDisplayName}
            textValue={providerDisplayName}
          />
        </Select>
      </FormField>
      {providerElement}
    </>
  )
}

export default Provider

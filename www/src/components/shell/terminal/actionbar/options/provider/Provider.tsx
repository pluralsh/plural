import { Dispatch, SetStateAction, useMemo } from 'react'
import { FormField, Input } from '@pluralsh/design-system'
import { A, Span } from 'honorable'

import { CloudProps, CloudProvider, CloudProviderDisplayName } from '../../../../onboarding/context/types'

import AWS from './AWS'
import Azure from './Azure'
import GCP from './GCP'

interface ProviderProps {
  setProps: SetStateAction<Dispatch<CloudProps>>
  setValid: SetStateAction<Dispatch<boolean>>
  provider: CloudProvider
  props: CloudProps
}

function Provider({
  props, provider, setValid, setProps,
}: ProviderProps) {
  const providerDisplayName = useMemo(() => (provider ? CloudProviderDisplayName[provider] : ''), [provider])
  const providerElement = useMemo(() => {
    switch (provider) {
    case CloudProvider.AWS:
      return (
        <AWS
          props={props}
          setProps={setProps}
          setValid={setValid}
        />
      )
    case CloudProvider.Azure:
      return (
        <Azure
          props={props}
          setProps={setProps}
          setValid={setValid}
        />
      )
    case CloudProvider.GCP:
      return (
        <GCP
          setProps={setProps}
          setValid={setValid}
        />
      )
    }
  }, [props, provider, setProps, setValid])

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
        <Input
          value={providerDisplayName}
          disabled
        />
      </FormField>
      {providerElement}
    </>
  )
}

export default Provider

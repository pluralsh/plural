import { Input } from '@pluralsh/design-system'

import { FormField } from '@pluralsh/design-system'
import { InputRevealer } from 'components/utils/InputRevealer'
import { useTheme } from 'styled-components'
import { ExternalOidcFormState } from './PluralCloudInstanceLoginSettings'

export function ExternalOidc({
  externalOidcState,
  setExternalOidcState,
}: {
  externalOidcState: ExternalOidcFormState
  setExternalOidcState: (newState: ExternalOidcFormState) => void
}) {
  const { colors } = useTheme()

  return (
    <>
      <FormField label="Issuer URL">
        <Input
          value={externalOidcState?.issuer ?? ''}
          placeholder="https://accounts.example.com"
          onChange={(e) =>
            setExternalOidcState({
              ...externalOidcState,
              issuer: e.target.value,
            })
          }
        />
      </FormField>
      <FormField label="Client ID">
        <Input
          value={externalOidcState?.clientId ?? ''}
          placeholder="Enter OIDC client ID"
          onChange={(e) =>
            setExternalOidcState({
              ...externalOidcState,
              clientId: e.target.value,
            })
          }
        />
      </FormField>
      <FormField label="Client Secret">
        <InputRevealer
          css={{ background: colors['fill-two'] }}
          value={externalOidcState?.clientSecret ?? ''}
          placeholder="Enter OIDC client secret"
          onChange={(e) =>
            setExternalOidcState({
              ...externalOidcState,
              clientSecret: e.target.value,
            })
          }
        />
      </FormField>
    </>
  )
}

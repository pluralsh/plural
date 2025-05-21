import { Flex, FormField } from '@pluralsh/design-system'
import {
  BindingInput,
  fetchGroups,
  fetchUsers,
} from 'components/account/Typeaheads'
import { UrlsInput } from 'components/app/oidc/OIDC'
import { useTheme } from 'styled-components'
import { PluralOidcFormState } from './PluralCloudInstanceLoginSettings'

export function PluralOidc({
  uriFormat,
  pluralOidcState,
  setPluralOidcState,
}: {
  uriFormat: Nullable<string>
  pluralOidcState: PluralOidcFormState
  setPluralOidcState: (newState: PluralOidcFormState) => void
}) {
  const { colors } = useTheme()

  return (
    <>
      <Flex
        gap="large"
        width="100%"
      >
        <BindingInput
          type="user"
          inputStyle={{ background: colors['fill-two'] }}
          css={{ flex: 1 }}
          bindings={pluralOidcState.bindings
            .filter(({ user }) => !!user)
            .map(({ user }) => user?.email)}
          fetcher={fetchUsers}
          add={(user) =>
            !pluralOidcState.bindings.some(
              ({ user: u }) => u?.email === user?.email
            ) &&
            setPluralOidcState({
              ...pluralOidcState,
              bindings: [...pluralOidcState.bindings, { user }],
            })
          }
          remove={(email) =>
            setPluralOidcState({
              ...pluralOidcState,
              bindings: pluralOidcState.bindings.filter(
                ({ user }) => user?.email !== email
              ),
            })
          }
        />
        <BindingInput
          type="group"
          css={{ flex: 1 }}
          inputStyle={{ background: colors['fill-two'] }}
          bindings={pluralOidcState.bindings
            .filter(({ group }) => !!group)
            .map(({ group }) => group?.name)}
          fetcher={fetchGroups}
          add={(group) =>
            !pluralOidcState.bindings.some(
              ({ group: g }) => g?.name === group?.name
            ) &&
            setPluralOidcState({
              ...pluralOidcState,
              bindings: [...pluralOidcState.bindings, { group }],
            })
          }
          remove={(name) =>
            setPluralOidcState({
              ...pluralOidcState,
              bindings: pluralOidcState.bindings.filter(
                ({ group }) => group?.name !== name
              ),
            })
          }
        />
      </Flex>
      <FormField label="Redirect urls">
        <UrlsInput
          uriFormat={uriFormat}
          urls={pluralOidcState.redirectUris}
          setUrls={(redirectUris) =>
            setPluralOidcState({ ...pluralOidcState, redirectUris })
          }
        />
      </FormField>
    </>
  )
}

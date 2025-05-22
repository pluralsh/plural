import { Button, Card, Flex, Switch, Toast } from '@pluralsh/design-system'
import { GqlError } from 'components/utils/Alert'
import { Body2BoldP } from 'components/utils/Typography'
import {
  ConsoleInstanceDocument,
  ConsoleInstanceFragment,
  ConsoleInstanceOidcFragment,
  OidcAuthMethod,
  OidcProviderBindingFragment,
  useRepositorySuspenseQuery,
  useUpdateConsoleInstanceMutation,
  useUpdateOidcProviderMutation,
} from 'generated/graphql'
import { useUpdateState } from 'hooks/useUpdateState'
import { isEqual, isEqualWith } from 'lodash'
import { useState } from 'react'
import styled from 'styled-components'
import { isNonNullable } from 'utils/isNonNullable'
import { bindingsToBindingAttributes } from '../../EditPluralOIDCClient'
import { ExternalOidc } from './ExternalOidc'
import { PluralOidc } from './PluralOidc'

export type PluralOidcFormState = {
  bindings: Pick<OidcProviderBindingFragment, 'group' | 'user'>[]
  redirectUris: string[]
}

export type ExternalOidcFormState = Nullable<
  Omit<ConsoleInstanceOidcFragment, '__typename'>
>

type CombinedOidcFormState = {
  pluralFormState: PluralOidcFormState
  externalFormState: ExternalOidcFormState
}

const BlankExternalFormState: ExternalOidcFormState = {
  clientId: '',
  clientSecret: '',
  issuer: '',
}

export function PluralCloudInstanceLoginSettings({
  instance,
}: {
  instance: ConsoleInstanceFragment
}) {
  const [showToast, setShowToast] = useState(false)
  const { data: repoData, error: errorRepo } = useRepositorySuspenseQuery({
    variables: { name: 'console' },
    fetchPolicy: 'cache-and-network',
  })

  const instanceExternalOidc = sanitizeExternalOidc(instance.oidc)

  const installation = repoData.repository?.installation
  const pluralOidcProvider = installation?.oidcProvider

  const providerState: PluralOidcFormState = {
    bindings: pluralOidcProvider?.bindings?.filter(isNonNullable) ?? [],
    redirectUris: pluralOidcProvider?.redirectUris?.filter(isNonNullable) ?? [],
  }

  const {
    state: { pluralFormState, externalFormState },
    update: updateForm,
    hasUpdates,
    reset: resetForm,
  } = useUpdateState<CombinedOidcFormState>(
    {
      pluralFormState: providerState,
      externalFormState: instanceExternalOidc,
    },
    {
      pluralFormState: (a, b) =>
        areBindingsEqual(a.bindings, b.bindings) &&
        isEqual(a.redirectUris, b.redirectUris),
      externalFormState: (a, b) => isEqual(a, b),
    }
  )

  const oidcType = !externalFormState ? 'plural' : 'external'

  const [
    updatePluralOidc,
    { loading: loadingPluralMutation, error: errorPluralMutation },
  ] = useUpdateOidcProviderMutation({
    variables: {
      id: installation?.id ?? '',
      attributes: {
        authMethod: pluralOidcProvider?.authMethod ?? OidcAuthMethod.Post,
        redirectUris: pluralFormState.redirectUris,
        bindings: bindingsToBindingAttributes(pluralFormState.bindings ?? []),
      },
    },
    awaitRefetchQueries: true,
    refetchQueries: ['Repository'],
    onCompleted: () => setShowToast(true),
  })

  const [
    updateExternalOidc,
    { loading: loadingExternalMutation, error: errorExternalMutation },
  ] = useUpdateConsoleInstanceMutation({
    awaitRefetchQueries: true,
    refetchQueries: [
      { query: ConsoleInstanceDocument, variables: { id: instance.id } },
    ],
    onCompleted: () => setShowToast(true),
  })

  const handleSave = () => {
    if (oidcType === 'plural') {
      updatePluralOidc()
      updateExternalOidc({
        variables: { id: instance.id, attributes: { oidc: null } },
      })
    } else {
      updateExternalOidc({
        variables: { id: instance.id, attributes: { oidc: externalFormState } },
      })
    }
  }

  const mutationLoading = loadingPluralMutation || loadingExternalMutation

  if (errorRepo) return <GqlError error={errorRepo} />

  return (
    <LoginSettingsWrapperCardSC>
      <Flex justify="space-between">
        <Flex
          gap="small"
          align="center"
        >
          <Body2BoldP $color={oidcType === 'plural' ? 'text' : 'text-xlight'}>
            Plural OIDC
          </Body2BoldP>
          <Switch
            css={{ gap: 0 }}
            checked={oidcType === 'external'}
            onChange={(isChecked) =>
              updateForm({
                externalFormState: isChecked
                  ? instanceExternalOidc ?? BlankExternalFormState
                  : null,
              })
            }
          />
          <Body2BoldP $color={oidcType === 'external' ? 'text' : 'text-xlight'}>
            External OIDC
          </Body2BoldP>
        </Flex>
        <Flex gap="medium">
          <Button
            secondary
            onClick={resetForm}
            disabled={!hasUpdates}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasUpdates}
            loading={mutationLoading}
          >
            Save
          </Button>
        </Flex>
      </Flex>
      {oidcType === 'plural' && (
        <>
          {errorPluralMutation && <GqlError error={errorPluralMutation} />}
          <PluralOidc
            uriFormat={repoData?.repository?.oauthSettings?.uriFormat}
            pluralOidcState={pluralFormState}
            setPluralOidcState={(newState) =>
              updateForm({ pluralFormState: newState })
            }
          />
        </>
      )}
      {oidcType === 'external' && (
        <>
          {errorExternalMutation && <GqlError error={errorExternalMutation} />}
          <ExternalOidc
            externalOidcState={externalFormState ?? BlankExternalFormState}
            setExternalOidcState={(newState) =>
              updateForm({ externalFormState: newState })
            }
          />
        </>
      )}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        closeTimeout={2500}
        severity="success"
        position="bottom"
      >
        Login settings updated successfully
      </Toast>
    </LoginSettingsWrapperCardSC>
  )
}

const LoginSettingsWrapperCardSC = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
  padding: theme.spacing.large,
}))

// allows bindings with different ids but same user/group value to be considered equal
export const areBindingsEqual = (
  a: PluralOidcFormState['bindings'],
  b: PluralOidcFormState['bindings']
) =>
  a.length === b.length &&
  isEqualWith(
    a,
    b,
    (valA, valB) =>
      valA.user?.id === valB.user?.id || valA.group?.id === valB.group?.id
  )

const sanitizeExternalOidc = (
  oidc: CombinedOidcFormState['externalFormState']
) =>
  oidc && {
    clientId: oidc.clientId,
    clientSecret: oidc.clientSecret,
    issuer: oidc.issuer,
  }

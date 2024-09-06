import {
  Accordion,
  AccordionItem,
  Button,
  Flex,
  FormField,
  Modal,
  PeopleIcon,
} from '@pluralsh/design-system'
import {
  BindingInput,
  fetchGroups,
  fetchUsers,
} from 'components/account/Typeaheads'
import { SanitizePropsType, sanitize } from 'components/account/utils'
import { UrlsInput } from 'components/app/oidc/OIDC'
import { GqlError } from 'components/utils/Alert'
import ImpersonateServiceAccount from 'components/utils/ImpersonateServiceAccount'
import {
  ConsoleInstanceFragment,
  InputMaybe,
  OidcAuthMethod,
  OidcProviderBinding,
  useRepositoryQuery,
  useUpdateOidcProviderMutation,
} from 'generated/graphql'
import { isEmpty } from 'lodash'
import { useState } from 'react'
import { useTheme } from 'styled-components'

export function ConsoleInstanceOIDC({
  instance,
}: {
  instance: ConsoleInstanceFragment
}) {
  const [open, setOpen] = useState(false)

  return (
    <ImpersonateServiceAccount
      id={instance.console?.owner?.id}
      renderIndicators={false}
    >
      <>
        <Button
          secondary
          startIcon={<PeopleIcon />}
          onClick={() => setOpen(true)}
        >
          OIDC
        </Button>
        <Modal
          onOpenAutoFocus={(e) => e.preventDefault()}
          open={open}
          onClose={() => setOpen(false)}
          size="large"
        >
          <ConsoleInstanceOIDCInner
            instance={instance}
            onClose={() => setOpen(false)}
          />
        </Modal>
      </>
    </ImpersonateServiceAccount>
  )
}

function ConsoleInstanceOIDCInner({
  instance,
  onClose,
}: {
  instance: ConsoleInstanceFragment
  onClose: () => void
}) {
  const [bindings, setBindings] = useState<any>([])
  const [redirectUris, setRedirectUris] = useState<InputMaybe<string>[]>([])

  const {
    data,
    loading: loadingRepo,
    error: errorRepo,
  } = useRepositoryQuery({
    variables: { name: 'console' },
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      setBindings(data?.repository?.installation?.oidcProvider?.bindings)
      setRedirectUris(
        data?.repository?.installation?.oidcProvider?.redirectUris ?? []
      )
    },
  })

  const installation = data?.repository?.installation
  const provider = installation?.oidcProvider

  const [mutation, { loading: loadingMutation, error: errorMutation }] =
    useUpdateOidcProviderMutation({
      variables: {
        id: installation?.id ?? '',
        attributes: {
          authMethod: provider?.authMethod ?? OidcAuthMethod.Post,
          redirectUris: isEmpty(redirectUris)
            ? [`https://${instance.url}/oauth/callback`]
            : redirectUris,
          bindings: bindings.map((value) =>
            sanitize(value as SanitizePropsType)
          ),
        },
      },
      onCompleted: onClose,
    })

  if (!provider?.bindings || loadingRepo || errorRepo) return null

  return (
    <Flex
      direction="column"
      gap="medium"
    >
      {errorMutation && <GqlError error={errorMutation} />}
      <MiniProviderForm
        bindings={bindings}
        setBindings={setBindings}
        redirectUris={redirectUris}
        setRedirectUris={setRedirectUris}
        uriFormat={data?.repository?.oauthSettings?.uriFormat}
      />
      <Flex
        gap="medium"
        alignSelf="flex-end"
      >
        <Button
          secondary
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            mutation()
          }}
          loading={loadingMutation}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  )
}

function MiniProviderForm({
  bindings,
  setBindings,
  redirectUris,
  setRedirectUris,
  uriFormat,
}: {
  bindings: Omit<OidcProviderBinding, 'id'>[]
  setBindings: (bindings: Omit<OidcProviderBinding, 'id'>[]) => void
  redirectUris: InputMaybe<string>[]
  setRedirectUris: (redirectUris: InputMaybe<string>[]) => void
  uriFormat?: string
}) {
  const theme = useTheme()

  return (
    <>
      <BindingInput
        label="User bindings"
        placeholder="Search for user"
        bindings={bindings
          .filter(({ user }) => !!user)
          .map(({ user }) => user?.email)}
        fetcher={fetchUsers}
        add={(user) => setBindings([...bindings, { user }])}
        remove={(email) =>
          setBindings(
            bindings.filter(({ user }) => !user || user.email !== email)
          )
        }
      />
      <BindingInput
        label="Group bindings"
        placeholder="Search for group"
        bindings={bindings
          .filter(({ group }) => !!group)
          .map(({ group }) => group?.name)}
        fetcher={fetchGroups}
        add={(group) => setBindings([...bindings, { group }])}
        remove={(name) =>
          setBindings(
            bindings.filter(({ group }) => !group || group.name !== name)
          )
        }
      />
      <Accordion
        type="single"
        css={{ background: 'transparent' }}
      >
        <AccordionItem
          trigger={<span css={theme.partials.text.overline}>advanced</span>}
          padding="compact"
        >
          <FormField
            label="Redirect urls"
            marginTop={theme.spacing.small}
          >
            <UrlsInput
              uriFormat={uriFormat}
              urls={redirectUris}
              setUrls={setRedirectUris}
            />
          </FormField>
        </AccordionItem>
      </Accordion>
    </>
  )
}
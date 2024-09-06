import {
  Button,
  Chip,
  Flex,
  InfoOutlineIcon,
  Modal,
  PeopleIcon,
  Tooltip,
} from '@pluralsh/design-system'
import {
  BindingInput,
  fetchGroups,
  fetchUsers,
} from 'components/account/Typeaheads'
import { SanitizePropsType, sanitize } from 'components/account/utils'
import { GqlError } from 'components/utils/Alert'
import ImpersonateServiceAccount from 'components/utils/ImpersonateServiceAccount'
import {
  ConsoleInstanceFragment,
  OidcAuthMethod,
  OidcProviderBinding,
  OidcProviderFragment,
  useRepositoryQuery,
  useUpdateOidcProviderMutation,
} from 'generated/graphql'
import { Span } from 'honorable'
import { useState } from 'react'

export function ConsoleInstanceOIDC({
  instance,
}: {
  instance: ConsoleInstanceFragment
}) {
  return (
    <ImpersonateServiceAccount
      id={instance.console?.owner?.id}
      renderIndicators={false}
    >
      <ConsoleInstanceOIDCInner />
    </ImpersonateServiceAccount>
  )
}

function ConsoleInstanceOIDCInner() {
  const [open, setOpen] = useState(false)

  const {
    data,
    loading: loadingRepo,
    error: errorRepo,
  } = useRepositoryQuery({
    variables: { name: 'console' },
  })

  const installation = data?.repository?.installation
  const provider = installation?.oidcProvider
  const [bindings, setBindings] = useState<any>(provider?.bindings ?? [])

  const [mutation, { loading: loadingMutation, error: errorMutation }] =
    useUpdateOidcProviderMutation({
      variables: {
        id: installation?.id ?? '',
        attributes: {
          authMethod: provider?.authMethod ?? OidcAuthMethod.Post,
          bindings: bindings.map((value) =>
            sanitize(value as SanitizePropsType)
          ),
        },
      },
      onCompleted: () => setOpen(false),
    })

  if (!installation || loadingRepo || errorRepo) return null

  return (
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
      >
        <Flex
          direction="column"
          gap="medium"
        >
          {errorMutation && <GqlError error={errorMutation} />}
          <MiniProviderForm
            provider={provider}
            bindings={bindings}
            setBindings={setBindings}
          />
          <Flex
            gap="medium"
            alignSelf="flex-end"
          >
            <Button
              secondary
              onClick={() => setOpen(false)}
              loading={loadingMutation}
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
      </Modal>
    </>
  )
}

function MiniProviderForm({
  provider,
  bindings,
  setBindings,
}: {
  provider: Nullable<OidcProviderFragment>
  bindings: Omit<OidcProviderBinding, 'id'>[]
  setBindings: (bindings: Omit<OidcProviderBinding, 'id'>[]) => void
}) {
  return (
    <>
      <BindingInput
        label="User bindings"
        placeholder="Search for user"
        bindings={bindings
          .filter(({ user }) => !!user)
          .map(({ user }) => user?.email)}
        customBindings={provider?.invites?.map((invite) => (
          <Tooltip label="Pending invitation">
            <Chip
              fillLevel={2}
              size="small"
              icon={<InfoOutlineIcon color="icon-xlight" />}
            >
              <Span color="text-primary-disabled">{invite?.email}</Span>
            </Chip>
          </Tooltip>
        ))}
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
    </>
  )
}

import { Button, Flex } from '@pluralsh/design-system'
import { GqlError } from 'components/utils/Alert'
import { EditableDiv } from 'components/utils/EditableDiv'
import { Body1P } from 'components/utils/Typography'
import {
  ConsoleInstanceDocument,
  useUpdateConsoleInstanceMutation,
} from 'generated/graphql'
import { useUpdateState } from 'hooks/useUpdateState'
import styled from 'styled-components'

export function NetworkPolicyForm({
  instanceId,
  initialCidrs,
  onClose,
}: {
  instanceId: string
  initialCidrs: string[]
  onClose: () => void
}) {
  const {
    state: { cidrs },
    update,
    hasUpdates,
  } = useUpdateState({ cidrs: initialCidrs })

  const [mutation, { loading, error }] = useUpdateConsoleInstanceMutation({
    variables: {
      id: instanceId,
      attributes: { network: { allowedCidrs: cidrs } },
    },
    awaitRefetchQueries: true,
    refetchQueries: [
      { query: ConsoleInstanceDocument, variables: { id: instanceId } },
    ],
    onCompleted: onClose,
  })

  return (
    <Flex
      direction="column"
      gap="large"
    >
      {error && <GqlError error={error} />}
      <Body1P>Each new line is a separate CIDR rule.</Body1P>
      <CidrInput
        initialValue={cidrs.join('\n')}
        setValue={(value) =>
          update({
            cidrs: value
              .split('\n')
              .filter((cidr) => cidr !== '')
              .map((cidr) => cidr.trim()),
          })
        }
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
          loading={loading}
          disabled={!hasUpdates || loading}
          onClick={() => mutation()}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  )
}

const CidrInput = styled(EditableDiv)(({ theme }) => ({
  maxHeight: 500,
  background: theme.colors['fill-two'],
  border: theme.borders['fill-two'],
  borderRadius: theme.borderRadiuses.large,
  padding: theme.spacing.medium,
  fontFamily: theme.fontFamilies.mono,
  color: theme.colors['text-light'],
}))

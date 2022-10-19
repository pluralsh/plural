import { useMutation } from '@apollo/client'
import { Button, Flex } from 'honorable'

import { UPDATE_ONBOARDING_CHECKLIST } from '../../../users/queries'

export function ChecklistFooter({ refetch }) {
  const [updateChecklist, { loading }] = useMutation(UPDATE_ONBOARDING_CHECKLIST)

  return (
    <Flex
      gap="small"
    >
      <Button
        as="a"
        href="https://discord.gg/pluralsh"
        target="_blank"
        rel="noopener noreferrer"
        secondary
        small
      >Support
      </Button>

      <Button
        as="a"
        href="https://docs.plural.sh/"
        target="_blank"
        rel="noopener noreferrer"
        secondary
        small
      >Docs
      </Button>

      <Button
        as="a"
        href="https://github.com/pluralsh/plural"
        target="_blank"
        rel="noopener noreferrer"
        secondary
        small
      >GitHub
      </Button>

      <Flex flex="1" />

      <Button
        small
        tertiary
        padding="none"
        loading={loading}
        onClick={() => updateChecklist({
          variables: {
            attributes: {
              onboardingChecklist: {
                dismissed: true,
              },
            },
          },
          onCompleted: refetch,
        })}
      >Dismiss
      </Button>
    </Flex>
  )
}

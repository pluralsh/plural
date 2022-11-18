import { useMutation } from '@apollo/client'
import { Button, Flex } from 'honorable'
import { useContext } from 'react'

import { OnboardingChecklistContext } from '../../../../contexts/OnboardingChecklistContext'

import { UPDATE_USER } from '../../../users/queries'
import { ONBOARDING_CHECKLIST_STATE } from '../../constants'
import {
  clearOnboardingChecklistState,
  isOnboardingChecklistHidden,
  setOnboardingChecklistState,
  shouldOnboardingChecklistReappear,
} from '../../persistance'
import { updateUserFragment } from '../../../../utils/graphql'
import { RootMutationType, RootMutationTypeUpdateUserArgs } from '../../../../generated/graphql'

export function ChecklistFooter({ setDismiss }: any) {
  const { setDismissed: setDismissedFromContext } = useContext(OnboardingChecklistContext)
  const [updateChecklist, { loading }] = useMutation<RootMutationType, RootMutationTypeUpdateUserArgs>(UPDATE_USER, {
    variables: {
      attributes: {
        onboardingChecklist: {
          dismissed: true,
        },
      },
    },
    update: updateUserFragment,
    onCompleted: () => clearOnboardingChecklistState(),
  })

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
        onClick={() => {
          setDismissedFromContext(true)

          if (!shouldOnboardingChecklistReappear() && !isOnboardingChecklistHidden()) {
            setOnboardingChecklistState(ONBOARDING_CHECKLIST_STATE.HIDDEN)
            setDismiss(true)

            return
          }

          if (!shouldOnboardingChecklistReappear()) {
            return
          }

          updateChecklist()
        }}
      >Dismiss
      </Button>
    </Flex>
  )
}

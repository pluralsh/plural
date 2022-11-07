import { useMutation } from '@apollo/client'
import { Button, Flex } from 'honorable'
import { useContext } from 'react'

import { OnboardingChecklistContext } from '../../../../contexts/OnboardingChecklistContext'

import { UPDATE_ONBOARDING_CHECKLIST } from '../../../users/queries'
import { ONBOARDING_CHECKLIST_STATE } from '../../constants'
import {
  clearOnboardingChecklistState,
  isOnboardingChecklistHidden,
  setOnboardingChecklistState,
  shouldOnboardingChecklistReappear,
} from '../../persistance'

export function ChecklistFooter({ refetch, setDismiss }: any) {
  const { setDismissed: setDismissedFromContext } = useContext(OnboardingChecklistContext)
  const [updateChecklist, { loading }] = useMutation(UPDATE_ONBOARDING_CHECKLIST, {
    variables: {
      attributes: {
        onboardingChecklist: {
          dismissed: true,
        },
      },
    },
    onCompleted: () => {
      refetch()
      clearOnboardingChecklistState()
    },
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

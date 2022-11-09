import { useMutation } from '@apollo/client'
import { useContext } from 'react'
import { useLocation } from 'react-router-dom'

import CurrentUserContext from '../../../contexts/CurrentUserContext'
import { OnboardingStatus } from '../../profile/types'
import { UPDATE_USER } from '../../users/queries'
import { OnboardingState, RootMutationType, RootMutationTypeUpdateUserArgs } from '../../../generated/graphql'
import { UserFragment } from '../../../models/user'

const FORCE_ONBOARDING = 'plural-force-onboarding'

function useOnboarded() {
  const { me } = useContext(CurrentUserContext)

  const [mutation] = useMutation<RootMutationType, RootMutationTypeUpdateUserArgs>(UPDATE_USER, {
    variables: { attributes: { onboarding: OnboardingState.Onboarded } },
    update: (cache, { data }) => {
      cache.modify({
        fields: {
          me: () => cache.writeFragment({
            data: data?.updateUser,
            fragment: UserFragment,
          }),
        },
      })
    },
  })

  const onboarding = me.onboarding || OnboardingStatus.NEW
  const fresh
    = onboarding === OnboardingStatus.NEW
    || !!localStorage.getItem(FORCE_ONBOARDING)

  return {
    mutation: fresh ? mutation : () => Promise.resolve(),
    fresh,
  }
}

export default useOnboarded

export function useIsCurrentlyOnboarding() {
  const { fresh } = useOnboarded()
  const { pathname } = useLocation()

  return fresh && (pathname.startsWith('/shell') || pathname.startsWith('/oauth/callback'))
}

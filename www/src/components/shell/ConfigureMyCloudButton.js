import { useMutation, useQuery } from '@apollo/client'
import { Confirm } from 'components/account/Confirm'
import { CurrentUserContext } from 'components/login/CurrentUser'
import { OnboardingStatus } from 'components/profile/types'
import { Button, CloudIcon } from 'pluralsh-design-system'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { DELETE_DEMO_PROJECT_QUERY, POLL_DEMO_PROJECT_QUERY } from './queries'

export default function ConfigureMyCloudButton() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const me = useContext(CurrentUserContext)
  const isOnboarded = me.onboarding === OnboardingStatus.ONBOARDED
  const { data } = useQuery(POLL_DEMO_PROJECT_QUERY, { pollInterval: 10000 })
  const [mutation, { loading, error }] = useMutation(DELETE_DEMO_PROJECT_QUERY, {
    onCompleted: () => {
      setOpen(false)
      navigate('/shell')
    },
  })

  if (!data || !isOnboarded) return

  return (
    <>
      <Button
        small
        pulse
        startIcon={<CloudIcon />}
        onClick={() => setOpen(true)}
      >
        Configure my cloud
      </Button>
      <Confirm
        open={open}
        title="Configure my cloud"
        text="Restart the onboarding process on your own cloud. This will delete your GCP cloud demo."
        close={() => setOpen(false)}
        submit={mutation}
        loading={loading}
        error={error}
        destructive
      />
    </>
  )
}

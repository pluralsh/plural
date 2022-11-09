import { useMutation, useQuery } from '@apollo/client'

import { Button, CloudIcon } from 'pluralsh-design-system'
import { useContext, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { OnboardingStatus } from '../profile/types'
import { Confirm } from '../account/Confirm'

import CurrentUserContext from '../../contexts/CurrentUserContext'

import { DELETE_DEMO_PROJECT_QUERY, POLL_DEMO_PROJECT_QUERY } from './queries'

export default function ConfigureMyCloudButton() {
  const [open, setOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { me } = useContext(CurrentUserContext)
  const isOnboarded = me.onboarding === OnboardingStatus.ONBOARDED
  const isChecklistRef = searchParams.get('ref') === 'checklist'
  const { data } = useQuery(POLL_DEMO_PROJECT_QUERY, { pollInterval: 10000 })
  const [mutation, { loading, error }] = useMutation(DELETE_DEMO_PROJECT_QUERY, {
    onCompleted: () => {
      setOpen(false)
      navigate('/shell')
    },
  })

  if (!data || !isOnboarded) return null

  return (
    <>
      <Button
        small
        pulse={isChecklistRef}
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
        submit={() => mutation()}
        loading={loading}
        error={error}
        destructive
      />
    </>
  )
}

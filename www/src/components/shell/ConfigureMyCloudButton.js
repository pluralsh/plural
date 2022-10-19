import { useMutation, useQuery } from '@apollo/client'
import { keyframes } from '@emotion/react'
import { Confirm } from 'components/account/Confirm'
import { Button, CloudIcon } from 'pluralsh-design-system'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { DELETE_DEMO_PROJECT_QUERY, POLL_DEMO_PROJECT_QUERY } from './queries'

const pulseKeyframes = keyframes`
  0% { box-shadow: 0 0 7px 2px #fff1; }
  70% { box-shadow: 0 0 7px 4px #fff2; }
  100% { box-shadow: 0 0 7px 2px #fff1; }
}`

export default function ConfigureMyCloudButton() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data } = useQuery(POLL_DEMO_PROJECT_QUERY, { pollInterval: 10000 })
  const [mutation, { loading, error }] = useMutation(DELETE_DEMO_PROJECT_QUERY, {
    onCompleted: () => {
      setOpen(false)
      navigate('/shell')
    },
  })

  if (!data) return

  return (
    <>
      <Button
        small
        startIcon={<CloudIcon />}
        onClick={() => setOpen(true)}
        // FIXME: Below props should be replaced with "pulse" property that doesn't work in app.
        animationDuration="4s"
        animationIterationCount="infinite"
        animationName={pulseKeyframes}
        _hover={{ animationPlayState: 'paused' }}
      >
        Configure my cloud
      </Button>
      <Confirm
        open={open}
        title="Configure your cloud"
        text="Restart the onboarding process on your own cloud. This will delete your GCP cloud demo."
        close={() => setOpen(false)}
        submit={mutation}
        loading={loading}
        error={error}
      />
    </>
  )
}

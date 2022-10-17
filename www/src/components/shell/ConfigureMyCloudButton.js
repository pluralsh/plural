import { useMutation } from '@apollo/client'
import { Confirm } from 'components/account/Confirm'
import { Button, CloudIcon } from 'pluralsh-design-system'
import { useState } from 'react'

import { DELETE_DEMO_PROJECT_QUERY } from './queries'

// TODO: Pulse, should only appear during demo, test mutation.
export default function ConfigureMyCloudButton() {
  const [open, setOpen] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_DEMO_PROJECT_QUERY, {
    onCompleted: () => setOpen(false),
  })

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

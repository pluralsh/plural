import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'

import { Onboarding } from '../onboarding_v3/Onboarding'
import { CLOUD_SHELL_QUERY, REBOOT_SHELL_MUTATION } from '../queries'

import Content from './terminal/Content'

function Shell() {
  const [booting, setBooting] = useState(false)
  const { data: shellData } = useQuery(CLOUD_SHELL_QUERY, { fetchPolicy: 'network-only' })
  const [rebootMutation] = useMutation(REBOOT_SHELL_MUTATION)
  const isAlive = useMemo(() => (shellData?.shell?.alive ?? false) || booting, [booting, shellData?.shell?.alive])

  useEffect(() => {
    if (shellData?.shell && !shellData.shell.alive) {
      rebootMutation()
      setBooting(true)
    }
  }, [rebootMutation, shellData])

  return (
    <>
      {isAlive && <Content />}
      {!isAlive && <Onboarding />}
    </>
  )
}

export default Shell

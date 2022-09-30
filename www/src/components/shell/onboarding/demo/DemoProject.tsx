import { useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { Box } from 'grommet'
import { LoopingLogo } from 'pluralsh-design-system'

import { CREATE_DEMO_PROJECT_MUTATION } from '../../queries'
import { GqlError } from '../../../utils/Alert'

import { PollProject } from './PollProject'

// TODO un-grommet this file
function DemoProject({
  next,
  setDemo,
}) {
  const [mutation, { data, error }] = useMutation(CREATE_DEMO_PROJECT_MUTATION)

  useEffect(() => {
    mutation()
  }, [mutation])

  if (error) {
    return (
      <GqlError
        error={error}
        header="Cannot create demo project"
      />
    )
  }

  if (data) {
    return (
      <PollProject
        demo={data.createDemoProject}
        setDemo={setDemo}
        next={next}
      />
    )
  }

  return (
    <Box fill>
      <LoopingLogo />
    </Box>
  )
}

export default DemoProject

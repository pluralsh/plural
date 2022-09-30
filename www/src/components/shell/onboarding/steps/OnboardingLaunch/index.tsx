import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { Div } from 'honorable'

import { GqlError } from '../../../../utils/Alert'

import {
  usePersistedCredentials,
  usePersistedDemoId,
  usePersistedGitData,
  usePersistedProvider,
  usePersistedWorkspace,
} from '../../../usePersistance'
import { CLOUD_SHELL_QUERY, CREATE_SHELL_MUTATION } from '../../../queries'

import OnboardingShellLaunchStatus from '../../demo/OnboardingShellLaunchStatus'

import JoinCommunityCard from './JoinCommunityCard'

const EMPTY_SHELL = { alive: false, status: {} }

function OnboardingLaunch() {
  const [{ scm }] = usePersistedGitData()
  const [provider] = usePersistedProvider()
  const [workspace] = usePersistedWorkspace()
  const [credentials] = usePersistedCredentials()
  const [demoId] = usePersistedDemoId()
  const navigate = useNavigate()

  const [createShellMutation, { data: mutationData, error }] = useMutation(CREATE_SHELL_MUTATION, {
    variables: {
      attributes: {
        credentials,
        workspace: {
          ...workspace,
          subdomain: `${workspace.subdomain}.onplural.sh`,
        },
        scm,
        provider,
        demoId,
      },
    },
  })

  const { data } = useQuery(CLOUD_SHELL_QUERY, {
    pollInterval: 2000,
    skip: !mutationData,
  })

  useEffect(() => {
    createShellMutation()
  }, [createShellMutation])

  useEffect(() => {
    if (data?.shell?.alive) {
      navigate('/shell')
    }
  }, [data, navigate])

  return (
    <>
      <OnboardingShellLaunchStatus
        shell={data?.shell || EMPTY_SHELL}
        error={error}
      />
      {!!error && (
        <Div marginTop="medium">
          <GqlError
            header="Error while creating shell instance"
            error={error}
          />
        </Div>
      )}
      <JoinCommunityCard />
    </>
  )
}

export default OnboardingLaunch

import { useContext, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Div } from 'honorable'

import { useNavigate } from 'react-router-dom'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import { CLOUD_SHELL_QUERY, CREATE_SHELL_MUTATION } from '../../query'

import { GqlError } from '../../../utils/Alert'
import { ShellStatus } from '../ShellStatus'

import { JoinCommunityCard } from '../JoinCommunityCard'

const EMPTY_SHELL = ({ alive: false, status: {} })

function CloudLaunch() {
  const navigate = useNavigate()
  const {
    scm,
    provider,
    workspace,
    credentials,
    demoId,
  } = useContext(CreateShellContext)

  const [createShellMutation, { data: mutationData, error }] = useMutation(CREATE_SHELL_MUTATION,
    {
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
  const { data } = useQuery(CLOUD_SHELL_QUERY,
    {
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
      <ShellStatus
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

export default CloudLaunch

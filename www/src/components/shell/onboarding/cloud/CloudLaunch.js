import { useContext, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Div, Flex, P } from 'honorable'
import { Button, DiscordIcon } from 'pluralsh-design-system'

import { useNavigate } from 'react-router-dom'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import { CLOUD_SHELL_QUERY, CREATE_SHELL_MUTATION } from '../../query'

import OnboardingCard from '../OnboardingCard'
import { GqlError } from '../../../utils/Alert'
import { ShellStatus } from '../ShellStatus'

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
      <OnboardingCard
        marginTop="xlarge"
        paddingBottom="medium"
      >
        <Flex
          align="center"
          justify="space-between"
        >
          <Div>
            <P
              body1
              bold
            >
              Join the community
            </P>
            <P
              body1
              color="text-light"
            >
              Receive support from our team.
            </P>
          </Div>
          <Button
            secondary
            endIcon={(
              <DiscordIcon />
            )}
            as="a"
            href="https://discord.gg/pluralsh"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Discord
          </Button>
        </Flex>
      </OnboardingCard>
    </>
  )
}

export default CloudLaunch

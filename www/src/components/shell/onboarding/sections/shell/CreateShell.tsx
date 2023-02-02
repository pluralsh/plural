import { Flex } from 'honorable'
import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ApolloClient,
  useApolloClient,
  useMutation,
  useQuery,
} from '@apollo/client'
import { ApolloError } from '@apollo/client/errors'
import { Button, Callout, ReturnIcon } from '@pluralsh/design-system'

import { OnboardingContext } from '../../context/onboarding'
import {
  CloudShell,
  CloudShellAttributes,
  DeleteShellDocument,
  Provider,
  RootMutationTypeCreateShellArgs,
  RootQueryType,
  ShellCredentialsAttributes,
} from '../../../../../generated/graphql'
import { CLOUD_SHELL_QUERY, CREATE_SHELL_MUTATION, SETUP_SHELL_MUTATION } from '../../../queries'
import {
  CloudProps,
  CloudProviderToProvider,
  OrgType,
  SCMProps,
  SectionKey,
  WorkspaceProps,
} from '../../context/types'
import { toCloudProviderAttributes } from '../../../utils/provider'

import { ShellStatus } from './ShellStatus'

const EMPTY_SHELL = ({ alive: false, status: {} }) as CloudShell

function toCloudShellAttributes(
  workspace: WorkspaceProps, scm: SCMProps, provider: Provider, cloud: CloudProps
): CloudShellAttributes {
  return {
    workspace: {
      bucketPrefix: workspace.bucketPrefix,
      cluster: workspace.clusterName,
      project: workspace.project,
      region: workspace.region,
      subdomain: `${workspace.subdomain}.onplural.sh`,
    },
    scm: {
      name: scm.repositoryName,
      token: scm.token,
      provider: scm.provider,
      org: scm.org?.orgType === OrgType.User ? null : scm.org?.name,
    },
    provider,
    demoId: null,
    credentials: { [cloud.provider!]: toCloudProviderAttributes(cloud) } as ShellCredentialsAttributes,
  } as CloudShellAttributes
}

async function createShell(
  client: ApolloClient<unknown>, workspace: WorkspaceProps, scm: SCMProps, cloud: CloudProps
): Promise<ApolloError | undefined> {
  const provider: Provider = (CloudProviderToProvider[cloud.provider!] as unknown) as Provider

  const { errors } = await client.mutate<CloudShell, RootMutationTypeCreateShellArgs>({
    mutation: CREATE_SHELL_MUTATION,
    variables: {
      attributes: toCloudShellAttributes(
        workspace, scm, provider, cloud
      ),
    } as RootMutationTypeCreateShellArgs,
  })

  if (errors) {
    return {
      graphQLErrors: errors,
    } as ApolloError
  }

  return undefined
}

function CreateShell() {
  const navigate = useNavigate()
  const client = useApolloClient()
  const {
    scm, cloud, workspace, sections, setSection,
  } = useContext(OnboardingContext)

  const [shell, setShell] = useState<CloudShell>()
  const [error, setError] = useState<ApolloError | undefined>()
  const [created, setCreated] = useState(false)
  const [setupShellCompleted, setSetupShellCompleted] = useState(false)

  const onBack = useCallback(() => setSection({ ...sections[SectionKey.CREATE_REPOSITORY]!, state: undefined }), [sections, setSection])
  const onRestart = useCallback(() => {
    setShell(undefined)
    setError(undefined)
    setCreated(false)
    setSetupShellCompleted(false)
    onBack()
  }, [onBack])

  const { data, error: shellQueryError, stopPolling } = useQuery<RootQueryType>(CLOUD_SHELL_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    initialFetchPolicy: 'network-only',
    pollInterval: 3000,
  })

  const [deleteShell] = useMutation(DeleteShellDocument)
  const [setupShell] = useMutation(SETUP_SHELL_MUTATION, {
    onError: error => {
      setError(error)
      deleteShell()
      stopPolling()
    },
    onCompleted: () => setSetupShellCompleted(true),
  })

  // Create shell
  useEffect(() => {
    const create = async () => {
      try {
        const error = await createShell(
          client, workspace, scm, cloud
        )

        if (error) {
          stopPolling()
          setError(error)
        }
      }
      catch (error) {
        setError(error as ApolloError)
        stopPolling()
      }
      finally {
        setCreated(true)
      }
    }

    if (!created) create()
  }, [client, cloud, error, scm, workspace, shell, created, stopPolling])

  useEffect(() => setError(shellQueryError), [shellQueryError])

  // Set shell on query data change
  useEffect(() => {
    if (data?.shell) setShell(data.shell)
  }, [data, setShell])

  // Run setup shell if it's alive and there are no errors.
  useEffect(() => {
    if (data?.shell?.alive && !error && !setupShellCompleted) setupShell()
  }, [data, error, setupShell, setupShellCompleted])

  // Redirect to shell after checking that shell is alive and accessible
  useEffect(() => {
    if (shell?.alive && !error && setupShellCompleted) navigate('/shell')
  }, [shell, navigate, setupShellCompleted, error])

  return (
    <>
      <ShellStatus
        shell={shell || EMPTY_SHELL}
        error={error}
        loading={!setupShellCompleted}
      />
      {!!error && (
        <Flex
          gap="large"
          justify="space-between"
          borderTop="1px solid border"
          paddingTop="large"
          paddingBottom="xsmall"
          paddingHorizontal="large"
          direction="column"
        >
          <Callout
            severity="warning"
            size="compact"
          >You must create a new, globally unique repo name after the cloud shell fails to build.
          </Callout>
          <Button
            onClick={() => onRestart()}
            startIcon={<ReturnIcon />}
            alignSelf="flex-end"
            width="fit-content"
          >
            Review configuration
          </Button>
        </Flex>
      )}
    </>
  )
}

export default CreateShell

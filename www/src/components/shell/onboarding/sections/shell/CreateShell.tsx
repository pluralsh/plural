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

import { Button } from '@pluralsh/design-system'

import { OnboardingContext } from '../../context/onboarding'
import {
  AwsShellCredentialsAttributes,
  AzureShellCredentialsAttributes,
  CloudShell,
  CloudShellAttributes,
  DeleteShellDocument,
  GcpShellCredentialsAttributes,
  Provider,
  RootMutationTypeCreateShellArgs,
  RootQueryType,
  ShellCredentialsAttributes,
} from '../../../../../generated/graphql'
import { CLOUD_SHELL_QUERY, CREATE_SHELL_MUTATION, SETUP_SHELL_MUTATION } from '../../../queries'
import {
  CloudProps,
  CloudProvider,
  CloudProviderToProvider,
  OrgType,
  SCMProps,
  WorkspaceProps,
} from '../../context/types'

import { ShellStatus } from './ShellStatus'

const EMPTY_SHELL = ({ alive: false, status: {} }) as CloudShell

async function createShell(
  client: ApolloClient<unknown>, workspace: WorkspaceProps, scm: SCMProps, cloud: CloudProps
): Promise<ApolloError | undefined> {
  const provider: Provider = (CloudProviderToProvider[cloud.provider!] as unknown) as Provider

  const { errors } = await client.mutate<CloudShell, RootMutationTypeCreateShellArgs>({
    mutation: CREATE_SHELL_MUTATION,
    variables: {
      attributes: {
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
      } as CloudShellAttributes,
    } as RootMutationTypeCreateShellArgs,
  })

  if (errors) {
    return {
      graphQLErrors: errors,
    } as ApolloError
  }

  return undefined
}

function toCloudProviderAttributes(cloud: CloudProps): AwsShellCredentialsAttributes | AzureShellCredentialsAttributes | GcpShellCredentialsAttributes | undefined {
  switch (cloud.provider) {
  case CloudProvider.AWS:
    return {
      accessKeyId: cloud.aws?.accessKey,
      secretAccessKey: cloud.aws?.secretKey,
    } as AwsShellCredentialsAttributes
  case CloudProvider.GCP:
    return {
      applicationCredentials: cloud.gcp?.applicationCredentials,
    } as GcpShellCredentialsAttributes
  case CloudProvider.Azure:
    return {
      clientId: cloud.azure?.clientID,
      clientSecret: cloud.azure?.clientSecret,
      storageAccount: cloud.azure?.storageAccount,
      subscriptionId: cloud.azure?.subscriptionID,
      tenantId: cloud.azure?.tenantID,
    } as AzureShellCredentialsAttributes
  }

  return undefined
}

function CreateShell() {
  const navigate = useNavigate()
  const client = useApolloClient()
  const { scm, cloud, workspace } = useContext(OnboardingContext)
  const [shell, setShell] = useState<CloudShell>()
  const [error, setError] = useState<ApolloError>()
  const [created, setCreated] = useState(false)
  const [setupShellCompleted, setSetupShellCompleted] = useState(false)
  const { setSection } = useContext(OnboardingContext)
  const [deleteShell] = useMutation(DeleteShellDocument, {
    onCompleted: () => onRestart(false),
  })
  const onBack = useCallback(() => setSection(s => ({ ...s, state: undefined })), [setSection])
  const onRestart = useCallback((shellAlive: boolean) => {
    if (shellAlive) {
      deleteShell()

      return
    }

    setShell(undefined)
    setError(undefined)
    setCreated(false)
    setSetupShellCompleted(false)
  }, [deleteShell])

  const { data, error: shellQueryError } = useQuery<RootQueryType>(CLOUD_SHELL_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    initialFetchPolicy: 'network-only',
    pollInterval: 3000,
  })

  const [setupShell] = useMutation(SETUP_SHELL_MUTATION, {
    onError: error => setError(error),
    onCompleted: () => setSetupShellCompleted(true),
  })

  // Create shell
  useEffect(() => {
    const create = async () => {
      try {
        const error = await createShell(
          client, workspace, scm, cloud
        )

        setError(error)
      }
      catch (error) {
        setError(error as ApolloError)
      }
      finally {
        setCreated(true)
      }
    }

    if (!created) create()
  }, [client, cloud, error, scm, workspace, shell, created])

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
          gap="medium"
          justify="space-between"
          borderTop="1px solid border"
          paddingTop="large"
          paddingBottom="xsmall"
          paddingHorizontal="large"
        >
          <Button
            secondary
            onClick={onBack}
          >Back
          </Button>
          <Button onClick={() => onRestart(shell?.alive || false)}>
            Restart Build
          </Button>
        </Flex>
      )}
    </>
  )
}

export default CreateShell

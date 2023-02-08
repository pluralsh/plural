import { CloudProps, CloudProvider } from '../onboarding/context/types'
import { AwsShellCredentialsAttributes, AzureShellCredentialsAttributes, GcpShellCredentialsAttributes } from '../../../generated/graphql'

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

export { toCloudProviderAttributes }

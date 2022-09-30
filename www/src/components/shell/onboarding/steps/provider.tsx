import { AwsForm, awsSynopsis } from '../common/aws'
import { GcpForm, gcpSynopsis } from '../common/gcp'

export const synopsis = ({ provider, ...rest }) => {
  switch (provider) {
  case 'AWS':
    return awsSynopsis(rest)
  case 'GCP':
    return gcpSynopsis(rest)
  }
}

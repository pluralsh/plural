import { awsSynopsis } from '../../www/src/components/shell/onboarding/common/aws'
import { gcpSynopsis } from '../../www/src/components/shell/onboarding/common/gcp'

export const synopsis = ({ provider, ...rest }) => {
  switch (provider) {
  case 'AWS':
    // @ts-ignore
    return awsSynopsis(rest)
  case 'GCP':
    // @ts-ignore
    return gcpSynopsis(rest)
  }
}

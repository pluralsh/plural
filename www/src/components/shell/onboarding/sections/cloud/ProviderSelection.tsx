import { Flex, Span } from 'honorable'
import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  CloudIcon,
  InfoOutlineIcon,
  Radio,
  Tooltip,
} from '@pluralsh/design-system'

import { OnboardingContext } from '../../context/onboarding'
import { CloudType } from '../../context/types'
import GCPLogoIcon from '../../assets/GCPLogoIcon.svg'
import CurrentUserContext from '../../../../../contexts/CurrentUserContext'

import { CloudOption } from './CloudOption'

function ProviderSelection() {
  const me = useContext(CurrentUserContext)
  const { cloud, setCloud, setValid } = useContext(OnboardingContext)
  const [path, setPath] = useState(cloud?.type)
  const isValid = useMemo(() => path !== undefined, [path])

  useEffect(() => setCloud(c => ({ ...c, type: path })), [path, setCloud])
  useEffect(() => setValid(isValid), [setValid, isValid])

  return (
    <Flex
      direction="column"
      gap="xlarge"
    >
      <Flex gap="xlarge">
        <CloudOption
          selected={path === CloudType.Cloud || path === CloudType.Local}
          onClick={() => (!path || path === CloudType.Demo) && setPath(CloudType.Cloud)}
          icon={(
            <CloudIcon
              size={40}
              color="text-light"
            />
          )}
          header="Use your own cloud"
          description="Connect your own cloud credentials and spin up your own cluster."
        />
        <CloudOption
          selected={path === CloudType.Demo}
          onClick={() => setPath(CloudType.Demo)}
          disabled={me?.demoed}
          tooltip={me?.demoed ? 'You have reached the maximum number of demo environment usage.' : undefined}
          icon={(
            <img
              src={GCPLogoIcon}
              width={40}
            />
          )}
          header="Try free demo"
          description="A six-hour instance of a GCP cloud to help get you started."
        />
      </Flex>
      {(path === CloudType.Cloud || path === CloudType.Local) && (
        <Flex
          direction="column"
          gap="small"
        >
          <Radio
            value={CloudType.Cloud.toString()}
            checked={path === CloudType.Cloud}
            onChange={({ target: { checked } }: any) => checked && setPath(CloudType.Cloud)}
          >
            <Flex gap="small">
              <Span>Use our cloud shell (quickest)</Span>
              <Tooltip label="We host a free cloud environment for you to use our CLI and run commands as if it was on your own computer.">
                <InfoOutlineIcon color="icon-light" />
              </Tooltip>
            </Flex>
          </Radio>
          <Radio
            value={CloudType.Local.toString()}
            checked={path === CloudType.Local}
            onChange={({ target: { checked } }: any) => checked && setPath(CloudType.Local)}
          >Install the CLI on your local machine
          </Radio>
        </Flex>
      )}
    </Flex>
  )
}

export { ProviderSelection }

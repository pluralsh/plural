import { Flex } from 'honorable'
import { CloudIcon, TerminalIcon } from '@pluralsh/design-system'
import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { OnboardingContext } from '../../context/onboarding'

import { CloudType } from '../../context/types'

import { CloudOption } from './CloudOption'

function ProviderSelection() {
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
          selected={path === CloudType.Cloud}
          onClick={() => setPath(CloudType.Cloud)}
          icon={(
            <CloudIcon
              size={40}
              color="text-light"
            />
          )}
          header="Cloud Shell"
          description="Plug in your cloud credentials and boot into Plural's cloud shell."
        />
        <CloudOption
          selected={path === CloudType.Local}
          onClick={() => setPath(CloudType.Local)}
          icon={(
            <TerminalIcon
              size={40}
              color="text-light"
            />
          )}
          header="Local terminal"
          description="Install the Plural CLI in your local environment."
        />
      </Flex>
    </Flex>
  )
}

export { ProviderSelection }

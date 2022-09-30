import {
  useCallback,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import { Box, Drop } from 'grommet'
import { MenuItem, Select } from 'honorable'
import { Button, FormField } from 'pluralsh-design-system'

import { CLOUDS, SECTION_CREDENTIALS } from '../../../constants'
import { usePersistedProvider } from '../../../usePersistance'

import { AwsForm } from '../../common/aws'
import { GcpForm } from '../../common/gcp'

import Exceptions from '../../Exceptions'
import OnboardingCard from '../../OnboardingCard'
import OnboardingNavSection from '../../OnboardingNavSection'
import useValidation from '../../useValidation'
import useOnboardingNavigation from '../../useOnboardingNavigation'

// TODO un-grommet this file
const ProviderForms = {
  AWS: AwsForm,
  GCP: GcpForm,
}

function CloudCredentials() {
  const ref = useRef()
  const [provider, setProvider] = usePersistedProvider()
  const { previousTo, nextTo } = useOnboardingNavigation(SECTION_CREDENTIALS)
  const { error, exceptions } = useValidation(SECTION_CREDENTIALS)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [setOpen])
  const Form = ProviderForms[provider]

  return (
    <>
      <OnboardingCard title="Configure cloud credentials">
        <FormField
          width="100%"
          marginTop="large"
          marginBottom="large"
          label="Cloud provider"
        >
          <Select
            width="100%"
            onChange={event => setProvider(event.target.value)}
            value={provider}
          >
            {CLOUDS.map(cloud => (
              <MenuItem
                key={cloud}
                value={cloud}
              >
                {cloud}
              </MenuItem>
            ))}
          </Select>
        </FormField>
        <Box>
          <Form />
        </Box>
        {open && (
          <Drop
            target={ref.current}
            onClickOutside={close}
            onEsc={close}
          >
            <Box width="250px" />
          </Drop>
        )}
        {exceptions && (
          <Exceptions exceptions={exceptions} />
        )}
      </OnboardingCard>
      <OnboardingNavSection>
        <Button
          secondary
          as={Link}
          to={previousTo}
        >
          Back
        </Button>
        <Button
          disabled={error}
          as={Link}
          to={nextTo}
        >
          Continue
        </Button>
      </OnboardingNavSection>
    </>
  )
}

export default CloudCredentials

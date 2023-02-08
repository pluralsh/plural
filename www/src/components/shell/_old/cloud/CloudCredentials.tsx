import {
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Box, Drop } from 'grommet'
import { MenuItem, Select } from 'honorable'

import { Button, FormField } from '../design-system/src'

import { growthbook } from '../../../../helpers/growthbook'

import { persistProvider } from '../../persistance'
import { providerToDisplayName } from '../../../utils/InstallDropdownButton'

import CreateShellContext from '../../../../contexts/CreateShellContext'
import { CLOUDS } from '../../constants'
import OnboardingNavSection from '../OnboardingNavSection'
import { Exceptions } from '../../validation'
import OnboardingCard from '../../onboarding/OnboardingCard'

import { ProviderForms } from './provider'

const FILTERED_CLOUDS = CLOUDS.filter(c => c !== 'AZURE')

function CloudCredentials() {
  const {
    provider,
    setProvider,
    workspace,
    setWorkspace,
    credentials,
    setCredentials,
    previous,
    next,
    error,
    exceptions,
  } = useContext(CreateShellContext)

  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [setOpen])
  const form = ProviderForms[provider]

  useEffect(() => {
    persistProvider(provider)
  }, [provider])

  const clouds = growthbook.isOn('azure-cloud-shell') ? CLOUDS : FILTERED_CLOUDS

  return (
    <OnboardingCard title="Configure cloud credentials">
      {/* Div wrapper needed for bottom padding show up
        when content overflows */}
      <div>
        <FormField
          width="100%"
          marginTop="large"
          marginBottom="large"
          label="Cloud provider"
        >
          <Select
            width="100%"
            onChange={({ target: { value } }) => {
              setProvider(value)
            }}
            value={provider}
          >
            {clouds.map(cloud => (
              <MenuItem
                key={cloud}
                value={cloud}
              >
                {providerToDisplayName[cloud]}
              </MenuItem>
            ))}
          </Select>
        </FormField>
        <Box>
          {createElement(form, {
            workspace,
            setWorkspace,
            credentials,
            setCredentials,
          })}
        </Box>
        {open && (
          <Drop
            target={ref.current as any}
            onClickOutside={close}
            onEsc={close}
          >
            <Box width="250px" />
          </Drop>
        )}
        {exceptions && <Exceptions exceptions={exceptions} />}
      </div>
      <OnboardingNavSection>
        <Button
          secondary
          onClick={() => {
            previous()
          }}
        >
          Back
        </Button>
        <Button
          disabled={error}
          onClick={() => {
            next()
          }}
        >
          Continue
        </Button>
      </OnboardingNavSection>
    </OnboardingCard>
  )
}

export default CloudCredentials

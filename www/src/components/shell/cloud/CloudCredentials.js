import { createElement, useCallback, useContext, useRef, useState } from 'react'
import { Box, Drop } from 'grommet'
import { MenuItem, Select } from 'honorable'
import { Button, FormField } from 'pluralsh-design-system'

import { CLOUDS } from '../constants'
import { CreateShellContext, NavSection, OnboardingCard } from '../CloudShell'
import { Exceptions } from '../validation'

import { ProviderForms } from './provider'

export function CloudCredentials({ doSetPath }) {
  const { provider, setProvider, workspace, setWorkspace, credentials, setCredentials, next, error, exceptions } = useContext(CreateShellContext)

  const ref = useRef()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [setOpen])
  const form = ProviderForms[provider]

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
            onChange={({ target: { value } }) => {
              setProvider(value)
            }}
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
          {createElement(form, { workspace, setWorkspace, credentials, setCredentials })}
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
        {exceptions && <Exceptions exceptions={exceptions} />}
      </OnboardingCard>
      {/* Navigation */}
      <NavSection>
        <Button
          secondary
          onClick={() => {
            doSetPath('')
          }}
        >
          Back
        </Button>
        <Button
          disabled={error}
          onClick={() => {
            next()
          }}
        >Continue
        </Button>
      </NavSection>
    </>
  )

}

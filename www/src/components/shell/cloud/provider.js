import React, { useCallback, useRef, useState } from 'react'

import { Down } from 'grommet-icons'

import { Box, Drop, Text } from 'grommet'
import { Divider, Button } from 'forge-core'

import { Provider } from '../../repos/misc'

import { CLOUDS } from '../constants'

import { Header } from '../CloudShell'

import { AWS_VALIDATIONS, AwsForm, awsSynopsis } from './aws'
import { GCP_VALIDATIONS, GcpForm, gcpSynopsis } from './gcp'
import { DemoProject } from './demo'

function CloudItem({ provider, setProvider }) {
  return (
    <Box
      direction="row"
      align="center"
      gap="small"
      onClick={() => setProvider(provider)}
      hoverIndicator="tone-light"
      pad="small"
    >
      <Provider
        provider={provider}
        width={30}
      />
      <Text
        size="small"
        weight={500}
      >{provider.toLowerCase()}
      </Text>
    </Box>
  )
}

const ProviderForms = {
  AWS: AwsForm,
  GCP: GcpForm,
}

export const CLOUD_VALIDATIONS = {
  AWS: AWS_VALIDATIONS,
  GCP: GCP_VALIDATIONS,
}

export const synopsis = ({ provider, ...rest }) => {
  switch (provider) {
    case 'AWS':
      return awsSynopsis(rest)
    case 'GCP':
      return gcpSynopsis(rest)
  }
}

export function ProviderForm({ provider, setProvider, workspace, setWorkspace, credentials, setCredentials, demo, setDemo, next }) {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [setOpen])

  const form = ProviderForms[provider]

  if (demo) {
    return (
      <DemoProject 
        setProvider={setProvider}
        workspace={workspace}
        setWorkspace={setWorkspace}
        credentials={credentials}
        setCredentials={setCredentials}
        next={next} />
    )
  }

  return (
    <>
      <Box
        fill
        align="center"
        justify="center"
        gap="small"
      >
        <Header text="Cloud Credentials" />
        <Box
          ref={ref}
          direction="row"
          align="center"
          gap="small"
          onClick={() => setOpen(true)}
          hoverIndicator="card"
          round="xsmall"
          pad="small"
        >
          <Text
            size="small"
            weight={500}
          >Provider
          </Text>
          <Provider
            provider={provider}
            width={40}
          />
          <Down size="small" />
        </Box>
        {React.createElement(form, { workspace, setWorkspace, credentials, setCredentials })}
        <Divider text='OR' />
        <Box flex={false} fill='horizontal' align='center' justify='center'>
          <Button 
            background='sidebarHover' 
            label='Use one of our demo GCP projects'
            onClick={() => setDemo(true)} />
        </Box>
      </Box>
      {open && (
        <Drop
          target={ref.current}
          onClickOutside={close}
          onEsc={close}
        >
          <Box width="250px">
            {CLOUDS.map(cloud => (
              <CloudItem
                provider={cloud}
                setProvider={setProvider}
              />
            ))}
          </Box>
        </Drop>
      )}
    </>
  )
}

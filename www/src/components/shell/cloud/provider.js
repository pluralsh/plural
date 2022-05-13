import { createElement, useCallback, useRef, useState } from 'react'
import { Down } from 'grommet-icons'
import { Box, Drop, Text } from 'grommet'
import { Button, Divider } from 'forge-core'

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

function CloudOption({ header, description, onClick }) {
  return (
    <Box
      width="50%"
      height="250px"
      pad="medium"
      round="xsmall"
      align="center"
      justify="center"
      hoverIndicator="card"
      border
      gap="small"
      onClick={onClick}
    >
      <Text
        size="small"
        weight={500}
      >{header}
      </Text>
      <Text size="small">{description}</Text>
    </Box>
  )
}

function CloudDecision({ setPath }) {
  return (
    <Box
      fill
      gap="small"
    >
      <Box
        direction="row"
        fill="horizontal"
        justify="center"
      >
        <Text>Choose Your Own Adventure</Text>
      </Box>
      <Box
        fill
        direction="row"
        align="center"
        justify="center"
        gap="small"
      >
        <CloudOption
          header="Use a Demo Account"
          description="We'll create a GCP project on the fly for you to give plural a spin (it will be deleted in 6hrs)"
          onClick={() => setPath('demo')}
        />
        <CloudOption
          header="Bring Your Own Cloud"
          description="Use credentials for one of your own cloud accounts to get started"
          onClick={() => setPath('byoc')}
        />
      </Box>
    </Box>
  )
}

export function ProviderForm({ provider, setProvider, workspace, setWorkspace, credentials, setCredentials, demo, setDemo, next }) {
  const ref = useRef()
  const [path, setPath] = useState(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [setOpen])
  const doSetPath = useCallback(path => {
    if (path === 'demo') setDemo(true)
    setPath(path)
  }, [setPath, setDemo])

  const form = ProviderForms[provider]

  if (!path) {
    return <CloudDecision setPath={doSetPath} />
  }

  if (demo) {
    return (
      <DemoProject
        setDemo={setDemo}
        setProvider={setProvider}
        workspace={workspace}
        setWorkspace={setWorkspace}
        credentials={credentials}
        setCredentials={setCredentials}
        next={next}
      />
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
        {createElement(form, { workspace, setWorkspace, credentials, setCredentials })}
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

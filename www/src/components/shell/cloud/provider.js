import { createElement, useCallback, useRef, useState } from 'react'
import { Down } from 'grommet-icons'
import { Box, Drop } from 'grommet'
import { Div, Flex, Img, P, Text } from 'honorable'

import { Button, CloudIcon, StatusIpIcon } from 'pluralsh-design-system'

import { Provider } from '../../repos/misc'

import { CLOUDS } from '../constants'
import { CardButton, DemoCard, Header, NavSection } from '../CloudShell'

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

function CloudOption({ providerLogo, header, description, checked, ...props }) {
  const bounceEase = 'cubic-bezier(.37,1.4,.62,1)'

  const checkMark = (
    <Div
      position="absolute"
      top={0}
      left={0}
      padding="medium"
    >
      <StatusIpIcon
        size={24}
        color="action-link-inline"
        transform={checked ? 'scale(1)' : 'scale(0)'}
        opacity={checked ? 1 : 0}
        transition={`all 0.2s ${bounceEase}`}
      />
    </Div>
  )
  
  return (
    <CardButton
      position="relative"
      {...props}
    >
      <Div
        marginHorizontal="auto"
        maxWidth={40}
        maxHeight={40}
        overflow="visible"
      >
        { providerLogo }
      </Div>
      <Text
        body1
        bold
        marginTop="medium"
      >
        {header}
      </Text>
      <Text
        caption
        color="text-light"
      >
        {description}
      </Text>
      {checkMark}
    </CardButton>
  )
}

function CloudDecision({ setPath, previous }) {
  const [nextPath, setNextPath] = useState()
  console.log('nextPath', nextPath)

  return (
    <>
      <DemoCard title="Choose a cloud">
        <P
          body1
          color="text-light"
          marginBottom="medium"
        >
          Plural makes it easy to plug into your own cloud, but we also provide a free demo cloud to help you get started.
        </P> 
        <Flex mx={-1}>
          <CloudOption
            checked={nextPath === 'demo'}
            providerLogo={(
              <Img
                src="/gcp.png"
                alt="Google Cloud logo"
                width="100%"
              />
            )}
            header="GCP Cloud Demo"
            description="A six-hour instance of a GCP cloud to help get you started."
            onClick={() => setNextPath('demo')}
          />
          <CloudOption
            checked={nextPath === 'byoc'}
            providerLogo={(
              <CloudIcon
                size={40}
                color="text-light"
              />
            )}
            header="Use Your Own Cloud"
            description="Plug in your cloud credentials and start building."
            onClick={() => setNextPath('byoc')}
          />
        </Flex>
      </DemoCard>
      {/* Navigation */}
      <NavSection>
        <Button
          secondary
          onClick={() => {
            previous()
          }}
        >
          Back
        </Button>
        <Button
          disabled={!nextPath}
          onClick={() => setPath(nextPath)}
        >Continue
        </Button>
      </NavSection>
    </>
  )
}

export function ProviderForm({ provider, setProvider, workspace, setWorkspace, credentials, setCredentials, demo, setDemo, next, previous }) {
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
    return (
      <CloudDecision
        setPath={doSetPath}
        previous={previous}
      />
    )
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

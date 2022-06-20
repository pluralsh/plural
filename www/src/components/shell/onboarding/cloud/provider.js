import { useCallback, useContext, useState } from 'react'
import { Div, H2, P, RadioGroup, Text } from 'honorable'
import { Radio } from 'pluralsh-design-system'

import CreateShellContext from '../../../../contexts/CreateShellContext'

import OnboardingCardButton from '../OnboardingCardButton'

import { AWS_VALIDATIONS, AwsForm, awsSynopsis } from './aws'
import { GCP_VALIDATIONS, GcpForm, gcpSynopsis } from './gcp'
import { DemoProject } from './demo'
import { CloudDecision } from './CloudDecision'
import CloudCredentials from './CloudCredentials'

export const ProviderForms = {
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

export function CloudOption({ providerLogo, header, description, selected, ...props }) {
  return (
    <OnboardingCardButton
      position="relative"
      selected={selected}
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
    </OnboardingCardButton>
  )
}

export function ChooseAShell({ options, selected, setSelected }) {
  return (
    <Div
      width="100%"
      marginTop="large"
    >
      <H2
        overline
        color="text-xlight"
        marginBottom="xsmall"
        width="100%"
      >
        Choose a shell
      </H2>
      <P
        body1
        color="text-light"
        marginBottom="medium"
      >
        Determine which shell you’ll use to get started. The cloud shell comes fully equipped with the Plural CLI and all required dependencies.
      </P>
      <RadioGroup>
        {options.map(({ label, value }) => (
          <Radio
            key={value}
            value={value}
            defaultChecked={value === 'cloud'}
            checked={value === selected}
            onClick={() => setSelected(value)}
          >
            {label}
          </Radio>
        ))}
      </RadioGroup>
    </Div>
  )
}

export function ProviderForm() {
  const { setProvider, workspace, setWorkspace, credentials, setCredentials, demo, setDemo, next } = useContext(CreateShellContext)
  const [path, setPath] = useState(null)

  const doSetPath = useCallback(path => {
    if (path === 'demo') setDemo(true)
    setPath(path)
  }, [setPath, setDemo])

  if (!path) {
    return (
      <CloudDecision doSetPath={doSetPath} />
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
    <CloudCredentials doSetPath={doSetPath} />
  )
}

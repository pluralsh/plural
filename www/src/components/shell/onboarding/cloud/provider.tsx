import {
  Div,
  H2,
  P,
  RadioGroup,
  Text,
} from 'honorable'
import { Radio } from 'pluralsh-design-system'

import OnboardingCardButton from '../OnboardingCardButton'

import { AWS_VALIDATIONS, AwsForm } from './aws'
import { GCP_VALIDATIONS, GcpForm } from './gcp'
import { AZURE_VALIDATIONS, AzureForm } from './azure'

export type ProviderKey = 'AWS' | 'GCP' | 'AZURE'

export const ProviderForms: Record<ProviderKey, any> = {
  AWS: AwsForm,
  GCP: GcpForm,
  AZURE: AzureForm,
}

export const CLOUD_CREDENTIALS_VALIDATIONS: Record<ProviderKey, any> = {
  AWS: AWS_VALIDATIONS,
  GCP: GCP_VALIDATIONS,
  AZURE: AZURE_VALIDATIONS,
}

export function CloudOption({
  icon,
  header,
  description,
  selected,
  ...props
}: any) {
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
        {icon}
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

export function ChooseAShell({ options, selected, setSelected }: any) {
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
        Determine which shell you'll use to get started. The cloud shell comes
        fully equipped with the Plural CLI and all required dependencies.
      </P>
      <RadioGroup>
        {options.map(({ label, value }) => (
          <Radio
            key={value}
            value={value}
            defaultChecked={value === 'cloud'}
            checked={value === selected}
            onChange={() => setSelected(value)}
          >
            {label}
          </Radio>
        ))}
      </RadioGroup>
    </Div>
  )
}

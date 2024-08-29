import {
  Button,
  Callout,
  Flex,
  FormField,
  Input,
  ListBoxItem,
  Select,
} from '@pluralsh/design-system'
import { CloudProvider, ConsoleSize } from 'generated/graphql'
import { useLayoutEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import {
  CreateClusterStepKey,
  useCreateClusterContext,
} from '../CreateClusterWizard'

export function ConfigureCloudInstanceStep() {
  const theme = useTheme()
  const { setCurStep, setContinueBtn } = useCreateClusterContext()

  const [clusterName, setClusterName] = useState('')
  const [clusterSize, setClusterSize] = useState<ConsoleSize>(ConsoleSize.Small)
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>(
    CloudProvider.Aws
  )
  const [region, setRegion] = useState<string | undefined>(regions[0])

  const canSubmit = !!(
    clusterName &&
    clusterSize &&
    cloudProvider &&
    (cloudProvider === CloudProvider.Aws ? region : true)
  )

  // using layout effect to avoid flickering
  useLayoutEffect(() => {
    setContinueBtn(
      <Button
        key="create"
        disabled={!canSubmit}
        // TODO: this should call useCreateConsoleInstance mutation
        onClick={() => setCurStep(CreateClusterStepKey.InstallCli)}
      >
        Continue
      </Button>
    )

    return () => {
      setContinueBtn(undefined)
    }
  }, [canSubmit, setContinueBtn, setCurStep])

  return (
    <Flex
      flexDirection="column"
      gap="medium"
    >
      <Callout
        css={{ marginBottom: theme.spacing.medium }}
        title="Your Console may take a few minutes to deploy."
      >
        After completing this step it may take a few minutes for your Console to
        deploy. It will run in the background as you proceed.
      </Callout>
      <FormFieldSC label="Cluster name">
        <Input
          placeholder="Enter cluster name"
          value={clusterName}
          onChange={(e) => setClusterName(e.target.value)}
        />
      </FormFieldSC>
      <FormFieldSC label="Cluster size">
        <Select
          selectedKey={clusterSize}
          onSelectionChange={(size) => setClusterSize(size as ConsoleSize)}
        >
          {Object.values(ConsoleSize)
            .reverse()
            .map((value) => (
              <ListBoxItem
                key={value}
                label={value}
              />
            ))}
        </Select>
      </FormFieldSC>
      <FormFieldSC label="Cloud">
        <Select
          selectedKey={cloudProvider}
          onSelectionChange={(cloudProvider) =>
            setCloudProvider(cloudProvider as CloudProvider)
          }
        >
          {Object.values(CloudProvider).map((value) => (
            <ListBoxItem
              key={value}
              label={value}
            />
          ))}
        </Select>
      </FormFieldSC>
      {cloudProvider === CloudProvider.Aws && (
        <FormFieldSC label="Region">
          <Select
            selectedKey={region}
            onSelectionChange={(region) => setRegion(region as string)}
          >
            {regions.map((region) => (
              <ListBoxItem
                key={region}
                label={region}
              />
            ))}
          </Select>
        </FormFieldSC>
      )}
    </Flex>
  )
}

const FormFieldSC = styled(FormField)(({ theme }) => ({
  color: theme.colors.text,
}))

const regions = ['us-east-1']
